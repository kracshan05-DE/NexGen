import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Nexgen admin" },
  // Staff pages must never appear in search results.
  robots: { index: false, follow: false },
};

/*
 * Render every admin page per request, never at build time. These pages depend
 * on who is signed in and on environment variables, so a copy prebuilt during
 * deployment would be wrong for everyone.
 */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
