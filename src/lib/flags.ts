import { site } from "@/content/site";
import {
  partners,
  placeholderPartners,
  placeholderTeam,
  placeholderTestimonials,
  team,
  testimonials,
} from "@/content/social-proof";

/**
 * Preview-only switch. When true, illustrative content from the original design
 * is rendered with a visible label and the site tells search engines not to
 * index it. Never set this on the production environment.
 */
export const showPlaceholders = process.env.SHOW_PLACEHOLDER_CONTENT === "true";

type Resolved<T> = { items: T[]; isPlaceholder: boolean };

function resolve<T>(real: T[], placeholder: T[]): Resolved<T> {
  if (real.length > 0) return { items: real, isPlaceholder: false };
  if (showPlaceholders) return { items: placeholder, isPlaceholder: true };
  return { items: [], isPlaceholder: false };
}

export const resolvedTestimonials = resolve(testimonials, placeholderTestimonials);
export const resolvedPartners = resolve(partners, placeholderPartners);
export const resolvedTeam = resolve(team, placeholderTeam);

/** True when any section on the page is showing illustrative content. */
export const hasPlaceholderContent =
  resolvedTestimonials.isPlaceholder ||
  resolvedPartners.isPlaceholder ||
  resolvedTeam.isPlaceholder;

/** The privacy page is public only once approved; preview builds can always see the draft. */
export const privacyPageVisible = site.legal.privacyPolicyApproved || showPlaceholders;
