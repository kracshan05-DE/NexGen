/** Enquiry statuses. Must match the CHECK constraint in supabase/schema.sql. */
export const statuses = [
  { value: "new", label: "New", hint: "Not yet replied to" },
  { value: "contacted", label: "Contacted", hint: "We have replied" },
  { value: "quoted", label: "Quoted", hint: "Quote sent" },
  { value: "won", label: "Won", hint: "Became a client" },
  { value: "lost", label: "Lost", hint: "Did not go ahead" },
  { value: "spam", label: "Spam", hint: "Not a real enquiry" },
] as const;

export type Status = (typeof statuses)[number]["value"];

export const statusValues = statuses.map((s) => s.value) as readonly Status[];

/** The path a real enquiry follows, in order. Shown as the pipeline on the dashboard. */
export const pipeline: readonly Status[] = ["new", "contacted", "quoted", "won"];

export function isStatus(value: unknown): value is Status {
  return statusValues.includes(value as Status);
}

export function statusLabel(value: string): string {
  return statuses.find((s) => s.value === value)?.label ?? value;
}

/** Dashboard filters: a single status, or "all" (everything except spam). */
export type View = Status | "all";

export function parseView(value: unknown): View {
  return isStatus(value) ? value : "all";
}
