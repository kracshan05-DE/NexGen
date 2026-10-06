"use client";

import { useEffect } from "react";
import { site } from "@/content/site";

/** Shown if a page throws while rendering, so visitors never see a blank screen. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" style={{ padding: "120px 0" }}>
      <div className="wrap">
        <p className="tag">Something went wrong</p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.15 }}>
          This page didn&apos;t load properly.
        </h1>
        <p
          style={{
            marginTop: 16,
            maxWidth: 480,
            color: "var(--ink-soft)",
            lineHeight: 1.6,
          }}
        >
          Please try again. If it keeps happening, call us on{" "}
          <a href={site.phone.href} style={{ textDecoration: "underline" }}>
            {site.phone.display}
          </a>
          .
        </p>
        <button
          type="button"
          className="btn btn-dark"
          style={{ marginTop: 28 }}
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
