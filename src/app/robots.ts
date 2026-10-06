import type { MetadataRoute } from "next";
import { hasPlaceholderContent } from "@/lib/flags";
import { getSiteUrl, isProductionDeployment } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments and placeholder builds are kept out of search engines.
  if (!isProductionDeployment() || hasPlaceholderContent) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const url = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
