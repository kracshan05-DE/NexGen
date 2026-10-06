import type { StaticImageData } from "next/image";
import type { IconName } from "@/components/Icon";

/**
 * SOCIAL PROOF — read before editing.
 *
 * The three arrays at the top (`testimonials`, `partners`, `team`) are what the
 * live site shows. They start EMPTY, and an empty array hides its section.
 * Add an entry only when it is real and the client has permission to publish it:
 * a testimonial must be a genuine quote from a genuine customer, and a partner
 * logo needs that company's consent.
 *
 * The `placeholder*` arrays below are the illustrative content from the client's
 * original design. They render ONLY when SHOW_PLACEHOLDER_CONTENT=true (preview
 * builds), with a visible "placeholder" label, so the design can be reviewed
 * without invented endorsements ever being presented to the public as real.
 */

export type Testimonial = {
  quote: string;
  /** Person's name, or their job title if they asked not to be named. */
  attribution: string;
  /** Company or a description of it, e.g. "Industrial distribution facility, NSW". */
  context: string;
};

export type Partner = {
  name: string;
  /** Optional line under the name, e.g. the partner's sector. */
  descriptor?: string;
  /** Imported logo file. Real partners should always have one. */
  logo?: StaticImageData;
  /** Placeholder-only: a generic glyph drawn beside the name. */
  glyph?: IconName;
  glyphColour?: string;
};

export type TeamMember = {
  name: string;
  role: string;
  tags: string[];
  bio: string;
  /** Imported portrait. Falls back to initials when omitted. */
  photo?: StaticImageData;
  /** Placeholder-only: initials shown in the avatar when the name is a role. */
  initials?: string;
};

// ---------------------------------------------------------------------------
// Live content — real, verified, permission granted.
// ---------------------------------------------------------------------------
export const testimonials: Testimonial[] = [];
export const partners: Partner[] = [];
export const team: TeamMember[] = [];

// ---------------------------------------------------------------------------
// Illustrative content from the original design. Preview builds only.
// ---------------------------------------------------------------------------
export const placeholderTestimonials: Testimonial[] = [
  {
    quote:
      "Nexgen took over our warehouse contract with two weeks' notice after our last provider dropped the ball. The scope was documented on day one, crews turned up on time, and reporting has been spot-on ever since.",
    attribution: "Operations Manager",
    context: "Industrial distribution facility, NSW",
  },
  {
    quote:
      "We needed a partner who actually understood cleanroom protocols, not just standard commercial cleaning. The air-particle testing reports have made our audits far less stressful.",
    attribution: "Facilities Lead",
    context: "Pharmaceutical manufacturing site, VIC",
  },
  {
    quote:
      "Fixed pricing, one contract, one point of contact across three sites. That alone has saved our facilities team hours every month, without chasing three separate contractors.",
    attribution: "Portfolio Manager",
    context: "Commercial property group, QLD",
  },
];

export const placeholderPartners: Partner[] = [
  { name: "MERIDIAN", descriptor: "PROPERTY & FACILITIES", glyph: "gem", glyphColour: "#1B4FDB" },
  { name: "HARBORLINE", descriptor: "LOGISTICS", glyph: "harbour", glyphColour: "#0E9488" },
  { name: "BLUESTONE", descriptor: "COMMERCIAL PROPERTY", glyph: "building", glyphColour: "#334155" },
  { name: "NORTHGATE", descriptor: "RETAIL & SHOPPING CENTRES", glyph: "retail", glyphColour: "#D98A15" },
  { name: "COASTAL FREIGHT", descriptor: "DISTRIBUTION", glyph: "truck", glyphColour: "#123CA8" },
  { name: "APEX INDUSTRIAL", descriptor: "MANUFACTURING", glyph: "peak", glyphColour: "#4B5563" },
];

export const placeholderTeam: TeamMember[] = [
  {
    name: "Operations Director",
    initials: "OD",
    role: "Client contracts & national scheduling",
    tags: ["15+ yrs facility services", "Multi-site contracts"],
    bio: "Oversees onboarding, crew rostering and service delivery across every active contract, and is the single point of escalation if anything needs to change on-site.",
  },
  {
    name: "Compliance & Safety Manager",
    initials: "CS",
    role: "WHS, audits & reporting",
    tags: ["WHS auditing", "ISO 14644 protocols"],
    bio: "Maintains the WHS management system, runs site inductions, and signs off on the scope of work and reporting standard for every controlled-environment contract.",
  },
];
