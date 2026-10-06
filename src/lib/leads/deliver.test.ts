import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateEstimate } from "@/lib/estimator";
import { createDatabaseSink } from "./database";
import { configuredSinks, deliverLead } from "./deliver";
import { buildLeadEmail, createEmailSink } from "./email";
import type { Lead, LeadSink } from "./types";

const lead: Lead = {
  reference: "NX-TEST01",
  receivedAt: "2026-10-05T00:00:00.000Z",
  name: "Alex Nguyen",
  company: "Harbour Logistics",
  email: "alex@example.com.au",
  phone: "0412 345 678",
  facilityType: "warehouse",
  location: "Botany 2019",
  message: "After-hours access only.",
  estimate: calculateEstimate({ area: 2000, type: "warehouse", frequency: "weekly" }),
};

const ok = (name: LeadSink["name"]): LeadSink => ({ name, send: async () => {} });
const failing = (name: LeadSink["name"]): LeadSink => ({
  name,
  send: async () => {
    throw new Error("boom");
  },
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("configuredSinks", () => {
  it("is empty when nothing is configured", () => {
    expect(configuredSinks({})).toEqual([]);
  });

  it("switches a sink on only when all of its variables are set", () => {
    expect(configuredSinks({ RESEND_API_KEY: "k", ENQUIRY_TO_EMAIL: "a@b.c" })).toEqual([]);
    expect(configuredSinks({ SUPABASE_URL: "https://x.supabase.co" })).toEqual([]);

    const both = configuredSinks({
      RESEND_API_KEY: "k",
      ENQUIRY_FROM_EMAIL: "Site <site@b.c>",
      ENQUIRY_TO_EMAIL: "a@b.c",
      SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_SECRET_KEY: "s",
    });
    expect(both.map((sink) => sink.name)).toEqual(["email", "database"]);
  });
});

describe("deliverLead", () => {
  it("succeeds when every destination accepts the lead", async () => {
    const result = await deliverLead(lead, [ok("email"), ok("database")]);
    expect(result).toEqual({ ok: true, delivered: ["email", "database"], failed: [] });
  });

  it("still succeeds when one destination fails, and records the failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await deliverLead(lead, [failing("email"), ok("database")]);
    expect(result.ok).toBe(true);
    expect(result.delivered).toEqual(["database"]);
    expect(result.failed).toEqual([{ sink: "email", reason: "boom" }]);
  });

  it("fails when every destination fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await deliverLead(lead, [failing("email"), failing("database")]);
    expect(result.ok).toBe(false);
    expect(result.delivered).toEqual([]);
  });

  it("refuses to claim success in production when nothing is configured", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await deliverLead(lead, [], { allowConsoleFallback: false });
    expect(result.ok).toBe(false);
    expect(error).toHaveBeenCalled();
  });

  it("logs the lead instead in development", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const result = await deliverLead(lead, [], { allowConsoleFallback: true });
    expect(result).toEqual({ ok: true, delivered: ["console"], failed: [] });
    expect(info).toHaveBeenCalled();
  });
});

describe("lead email", () => {
  it("escapes HTML in user input", () => {
    const { html } = buildLeadEmail({
      ...lead,
      name: `<img src=x onerror=alert(1)>`,
      message: `"quoted" & <b>bold</b>`,
    });
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>bold</b>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&quot;quoted&quot; &amp; &lt;b&gt;bold&lt;/b&gt;");
  });

  it("keeps the subject on one line so input cannot inject headers", () => {
    const { subject } = buildLeadEmail({ ...lead, name: "Alex\r\nBcc: attacker@example.com" });
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toContain("[NX-TEST01]");
  });

  it("includes the server-calculated estimate", () => {
    const { text } = buildLeadEmail(lead);
    expect(text).toContain("2,000 sqm · Warehouse & industrial · Weekly · $280 – $380 per visit");
    expect(text).toContain("Estimated monthly range: $1,204 – $1,634");
  });

  it("posts to Resend with the prospect as reply-to", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await createEmailSink({
      apiKey: "re_test",
      from: "Site <site@nexgenfm.com.au>",
      to: "one@nexgenfm.com.au, two@nexgenfm.com.au",
    }).send(lead);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["one@nexgenfm.com.au", "two@nexgenfm.com.au"]);
    expect(body.reply_to).toBe("alex@example.com.au");
  });

  it("throws when Resend rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 422 })));
    await expect(
      createEmailSink({ apiKey: "k", from: "a@b.c", to: "d@e.f" }).send(lead),
    ).rejects.toThrow("Resend responded 422");
  });
});

describe("database sink", () => {
  it("inserts a row with snake_case columns and nulls for blanks", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await createDatabaseSink({ url: "https://x.supabase.co/", secretKey: "secret" }).send({
      ...lead,
      company: "",
      message: "",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://x.supabase.co/rest/v1/enquiries");
    expect(init.headers.apikey).toBe("secret");
    const row = JSON.parse(init.body);
    expect(row).toMatchObject({
      reference: "NX-TEST01",
      facility_type: "warehouse",
      company: null,
      message: null,
    });
    expect(row.estimate.perVisit).toEqual({ low: 280, high: 380 });
  });

  it("throws when Supabase rejects the insert", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 401 })));
    await expect(
      createDatabaseSink({ url: "https://x.supabase.co", secretKey: "bad" }).send(lead),
    ).rejects.toThrow("Supabase responded 401");
  });
});
