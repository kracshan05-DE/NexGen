/**
 * Single source of truth for business details.
 * Anything set to `null` is treated as "not supplied yet" and is left out of
 * the rendered site, so a placeholder can never reach production by accident.
 */
export const site = {
  name: "Nexgen Facility Management",
  shortName: "Nexgen",
  legalName: "Nexgen Facility Management Pty Ltd",
  title:
    "Nexgen Facility Management | Commercial Cleaning & Compliance-Led Maintenance",
  description:
    "Nexgen Facility Management delivers WHS-compliant cleaning and maintenance for data centres, cleanrooms, warehouses and commercial facilities across Australia. Fixed-scope quoting, one point of contact, 24/7 response.",
  summary:
    "Specialist cleaning and facility maintenance for critical, controlled and commercial environments across Australia.",
  locale: "en-AU",
  phone: { display: "1300 639 436", href: "tel:1300639436", e164: "+611300639436" },
  email: "enquiries@nexgenfm.com.au",
  cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  /** Time zone used for dates in the admin dashboard. */
  timeZone: "Australia/Sydney",

  // --- To be supplied by the client -------------------------------------
  /** Australian Business Number, e.g. "12 345 678 901". */
  abn: null as string | null,
  /** Year the business was established, e.g. 2010. */
  established: null as number | null,
  social: {
    linkedin: null as string | null,
    facebook: null as string | null,
  },
  legal: {
    /**
     * The /privacy page ships as a draft written to match what this site
     * actually does with enquiry data. Set to true once the client (or their
     * adviser) has reviewed and approved the wording. Until then the page is
     * not published on the live site.
     */
    privacyPolicyApproved: false as boolean,
  },
} as const;

export const stats = [
  { value: "15+", label: "Years experience" },
  { value: "500+", label: "Facilities serviced" },
  { value: "8", label: "Service sectors" },
  { value: "100%", label: "WHS compliant" },
] as const;

export const heroChecks = [
  "WHS & insurance compliant crews",
  "Fixed-scope, fixed-fee quoting",
  "Free on-site assessment",
  "24/7 emergency response",
] as const;
