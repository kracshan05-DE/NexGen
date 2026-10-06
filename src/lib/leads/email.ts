import { describeEstimate, facilityLabel, formatRange } from "@/lib/estimator";
import type { Lead, LeadSink } from "./types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 8_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Removes line breaks so user input can never inject extra email headers. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function rows(lead: Lead): [string, string][] {
  const out: [string, string][] = [
    ["Name", lead.name],
    ["Company", lead.company || "—"],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Facility type", facilityLabel(lead.facilityType)],
    ["Site location", lead.location || "—"],
  ];
  if (lead.estimate) {
    out.push(["Estimator inputs", describeEstimate(lead.estimate)]);
    out.push(["Estimated monthly range", formatRange(lead.estimate.monthly)]);
  }
  out.push(["Message", lead.message || "—"]);
  out.push(["Reference", lead.reference]);
  out.push(["Received (UTC)", lead.receivedAt]);
  return out;
}

export function buildLeadEmail(lead: Lead): {
  subject: string;
  text: string;
  html: string;
} {
  const who = lead.company ? `${lead.name} (${lead.company})` : lead.name;
  const subject = singleLine(`Website enquiry: ${who} [${lead.reference}]`);
  const data = rows(lead);

  const text = data.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;color:#12161C">${data
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="border-bottom:1px solid #e5e7eb;white-space:nowrap">${escapeHtml(k)}</th><td style="border-bottom:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;

  return { subject, text, html };
}

/**
 * Emails the lead to the client through Resend's HTTP API.
 * Plain `fetch` on purpose: one endpoint does not justify an SDK dependency.
 */
export function createEmailSink(config: {
  apiKey: string;
  from: string;
  to: string;
}): LeadSink {
  return {
    name: "email",
    async send(lead) {
      const { subject, text, html } = buildLeadEmail(lead);
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: config.to.split(",").map((address) => address.trim()),
          // Replying in the mail client goes straight to the prospect.
          reply_to: lead.email,
          subject,
          text,
          html,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Resend responded ${response.status}`);
      }
    },
  };
}
