import type { NextConfig } from "next";

/*
 * Security headers sent with every response.
 *
 * The Content-Security-Policy here restricts the things that can be locked
 * down without breaking Next.js: who may frame the site, where forms may post,
 * and plugin content. A strict script policy needs per-request nonces, which
 * would force every page to render on demand instead of being served static
 * from the CDN. For a site with no third-party scripts that trade is not worth
 * it; revisit if analytics or embeds are added.
 *
 * HSTS is intentionally not set here. Vercel adds it for the site's own
 * domain. Extending it to all subdomains or the browser preload list is a
 * decision for whoever controls the client's DNS, because it also affects
 * mail and other services on the same domain.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Serve AVIF where the browser supports it, WebP otherwise.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
