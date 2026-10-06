import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { navItems } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header items={navItems} />
      <main
        id="main"
        tabIndex={-1}
        style={{ padding: "calc(var(--header-h) + 96px) 0 120px" }}
      >
        <div className="wrap">
          <p className="tag">Error 404</p>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.15 }}>
            We can&apos;t find that page.
          </h1>
          <p
            style={{
              marginTop: 16,
              maxWidth: 480,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
            }}
          >
            The link may be out of date. Head back to the home page to see our
            services or request a site assessment.
          </p>
          <Link href="/" className="btn btn-dark" style={{ marginTop: 28 }}>
            Back to home
          </Link>
        </div>
      </main>
      <Footer items={navItems} />
    </>
  );
}
