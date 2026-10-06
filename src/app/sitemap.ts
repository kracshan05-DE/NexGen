import type { MetadataRoute } from "next";
import { privacyPageVisible } from "@/lib/flags";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: `${url}/`, changeFrequency: "monthly", priority: 1 },
  ];
  if (privacyPageVisible) {
    entries.push({ url: `${url}/privacy`, changeFrequency: "yearly", priority: 0.2 });
  }
  return entries;
}
