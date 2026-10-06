/**
 * Shown under a section only when it is rendering illustrative content in a
 * preview build. It can never appear on the live site, because the live site
 * does not render that content at all.
 */
export function PlaceholderNote({ what }: { what: string }) {
  return (
    <p className="placeholder-note" role="note">
      Preview only — {what} are illustrative placeholders and are hidden on the
      live site until real ones are supplied.
    </p>
  );
}
