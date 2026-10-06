import { hasPlaceholderContent } from "@/lib/flags";

/** A strip pinned to the bottom of preview builds that contain illustrative content. */
export function PreviewBanner() {
  if (!hasPlaceholderContent) return null;
  return (
    <aside
      aria-label="Preview notice"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        padding: "8px 16px",
        fontSize: 12.5,
        fontWeight: 600,
        textAlign: "center",
        color: "#7a2e0e",
        background: "#fff4e5",
        borderTop: "1px dashed #d98a15",
      }}
    >
      Preview build — includes placeholder content that is not shown on the live
      site.
    </aside>
  );
}
