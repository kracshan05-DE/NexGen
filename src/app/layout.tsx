import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/content/site";
import { hasPlaceholderContent } from "@/lib/flags";
import { getSiteUrl, isProductionDeployment } from "@/lib/site-url";
import "./globals.css";

/*
 * Fonts are self-hosted (files live in src/fonts) instead of loaded from
 * Google. That removes a third-party request from the critical path, avoids
 * sending visitor IPs to Google, and lets Next.js generate size-matched
 * fallbacks so text does not shift when the web font arrives.
 */
const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "../fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const plexMono = localFont({
  src: "../fonts/ibm-plex-mono-latin-500-normal.woff2",
  variable: "--font-plex-mono",
  weight: "500",
  display: "swap",
  // Used for small labels only, so it does not need to block first paint.
  preload: false,
});

// Previews and placeholder builds must never be indexed by search engines.
const indexable = isProductionDeployment() && !hasPlaceholderContent;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  robots: indexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12161c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={site.locale}
      // Smooth scrolling is for in-page links. This tells Next.js to switch it
      // off while moving between pages, so a new page opens at the top at once.
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
