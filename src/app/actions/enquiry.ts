"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { site } from "@/content/site";
import {
  HONEYPOT_FIELD,
  enquiryFields,
  validateEnquiry,
  type EnquiryState,
  type EnquiryValues,
} from "@/lib/enquiry";
import { calculateEstimate } from "@/lib/estimator";
import { deliverLead } from "@/lib/leads/deliver";
import type { Lead } from "@/lib/leads/types";
import { rateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** e.g. "NX-7K2M9Q". Unambiguous characters only, so it can be read out over the phone. */
function createReference(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return `NX-${out}`;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function clientIp(): Promise<string | null> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}

/**
 * Handles the enquiry form.
 *
 * Runs only on the server. The browser posts the form here; nothing in this
 * file (API keys, delivery logic) is shipped to the client.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const values = Object.fromEntries(
    enquiryFields.map((field) => [field, text(formData, field)]),
  ) as EnquiryValues;

  // 1. Honeypot. A hidden field people cannot see; scripts that fill every
  //    input give themselves away. Answer "success" so the bot learns nothing.
  if (text(formData, HONEYPOT_FIELD) !== "") {
    console.warn("[enquiry] Dropped a submission that filled the honeypot.");
    return { status: "success", reference: createReference() };
  }

  // 2. Validate. The browser ran these same rules, but only this run counts:
  //    anyone can post to the server without going through the form.
  const parsed = validateEnquiry(values);
  if (!parsed.ok) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors: parsed.errors,
      values: parsed.values,
    };
  }

  // 3. Rate limit per client address. Checked after validation on purpose:
  //    a visitor fixing typos should not use up their allowance. Only
  //    submissions that would actually be delivered count.
  const ip = await clientIp();
  if (ip && !rateLimit(`enquiry:${ip}`, RATE_LIMIT).allowed) {
    return {
      status: "error",
      message: `Too many attempts. Please wait a few minutes, or call us on ${site.phone.display}.`,
      fieldErrors: {},
      values,
    };
  }

  // 4. Recompute the estimate from its inputs. The price is derived here, on
  //    the server, so a tampered form cannot put a made-up figure in the lead.
  const estimate = calculateEstimate({
    area: Number(text(formData, "estimateArea")),
    type: parsed.data.facilityType,
    frequency: text(formData, "estimateFrequency"),
  });

  const lead: Lead = {
    ...parsed.data,
    reference: createReference(),
    receivedAt: new Date().toISOString(),
    estimate,
  };

  // 5. Deliver.
  const result = await deliverLead(lead);
  if (!result.ok) {
    return {
      status: "error",
      message: `Sorry, we couldn't send your enquiry just now. Please call ${site.phone.display} or email ${site.email}.`,
      fieldErrors: {},
      values,
    };
  }

  return { status: "success", reference: lead.reference };
}
