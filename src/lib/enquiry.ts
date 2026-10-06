import { facilityTypeValues, type FacilityType } from "@/lib/estimator";

/*
 * The enquiry form's rules, in one place.
 *
 * The same functions run twice:
 *   - in the browser, as the visitor leaves each field, so mistakes are
 *     pointed out straight away in the page's own style;
 *   - on the server, when the form arrives, which is the check that counts.
 *     Anyone can skip the browser and post to the server directly.
 *
 * Because both sides call this file, the browser can never accept something
 * the server rejects, or show a different message for the same mistake. It
 * has no dependencies, so it adds almost nothing to the page's JavaScript.
 */

export const enquiryFields = [
  "name",
  "company",
  "email",
  "phone",
  "facilityType",
  "location",
  "message",
] as const;

export type EnquiryField = (typeof enquiryFields)[number];
export type EnquiryValues = Record<EnquiryField, string>;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export const enquiryFacilityValues = [...facilityTypeValues, "other"] as const;
export type EnquiryFacility = FacilityType | "other";

/** A validated, cleaned enquiry. */
export type EnquiryInput = Omit<EnquiryValues, "facilityType"> & {
  facilityType: EnquiryFacility;
};

export const limits = {
  name: 100,
  company: 120,
  email: 254,
  phone: 30,
  location: 120,
  message: 2000,
} as const;

export const requiredFields: readonly EnquiryField[] = [
  "name",
  "email",
  "phone",
  "facilityType",
];

// Something@something.tld, with no spaces. Deliberately not stricter: the only
// real proof an address works is that mail sent to it arrives.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS = /^[0-9+()\-\s]+$/;
const HAS_LETTER = /\p{L}/u;

/** Trims every field and normalises line breaks (browsers submit CRLF). */
export function cleanEnquiry(values: Partial<EnquiryValues>): EnquiryValues {
  const out = {} as EnquiryValues;
  for (const field of enquiryFields) {
    out[field] = (values[field] ?? "").replace(/\r\n?/g, "\n").trim();
  }
  return out;
}

/** Returns the problem with one field, or null if it is fine. Expects a cleaned value. */
export function validateField(field: EnquiryField, value: string): string | null {
  switch (field) {
    case "name":
      if (value.length === 0) return "Enter your full name";
      if (value.length < 2 || !HAS_LETTER.test(value)) return "Enter your full name";
      if (value.length > limits.name) return "Name is too long";
      return null;

    case "email":
      if (value.length === 0) return "Enter your email address";
      if (value.length > limits.email) return "Email address is too long";
      if (!EMAIL.test(value)) return "Enter a valid email address";
      return null;

    case "phone": {
      if (value.length === 0) return "Enter a phone number";
      if (value.length > limits.phone) return "Phone number is too long";
      if (!PHONE_CHARACTERS.test(value)) return "Use digits only: 0412 345 678";
      const digits = value.replace(/\D/g, "").length;
      if (digits < 8 || digits > 15) return "Enter a full phone number";
      return null;
    }

    case "facilityType":
      if (!(enquiryFacilityValues as readonly string[]).includes(value)) {
        return "Choose a facility type";
      }
      return null;

    case "company":
      return value.length > limits.company ? "Company name is too long" : null;

    case "location":
      return value.length > limits.location ? "Location is too long" : null;

    case "message":
      return value.length > limits.message
        ? "Keep your message under 2,000 characters"
        : null;
  }
}

export type ValidationResult =
  | { ok: true; data: EnquiryInput }
  | { ok: false; errors: EnquiryErrors; values: EnquiryValues };

/** Cleans and checks a whole enquiry. */
export function validateEnquiry(raw: Partial<EnquiryValues>): ValidationResult {
  const values = cleanEnquiry(raw);
  const errors: EnquiryErrors = {};
  for (const field of enquiryFields) {
    const problem = validateField(field, values[field]);
    if (problem) errors[field] = problem;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors, values };
  return { ok: true, data: values as EnquiryInput };
}

/* ---------- state returned by the server action ---------- */

export type EnquiryState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: EnquiryErrors;
      /** Echoed back so a failed submit never wipes what the visitor typed. */
      values: Partial<EnquiryValues>;
    }
  | { status: "success"; reference: string };

export const initialEnquiryState: EnquiryState = { status: "idle" };

/** The honeypot input's name. Real visitors never see or fill it. */
export const HONEYPOT_FIELD = "confirm_details";
