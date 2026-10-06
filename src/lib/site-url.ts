/**
 * Absolute origin of the deployed site, used for canonical URLs, the sitemap
 * and social cards.
 *
 * Order: explicit setting → Vercel's production domain → Vercel's per-deploy
 * URL → local dev. Set NEXT_PUBLIC_SITE_URL once the real domain is connected.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** True only for the public production deployment. Previews must not be indexed. */
export function isProductionDeployment(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}
