import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Estimate } from "@/lib/estimator";
import { statusValues, type Status, type View } from "./statuses";

/*
 * Reads for the admin dashboard. Every function takes the signed-in admin's
 * own Supabase client (from requireAdmin), so each query runs with that
 * person's permissions and the database decides what they may see.
 */

export const PAGE_SIZE = 25;
export const REFERENCE_PATTERN = /^NX-[2-9A-Z]{6}$/;

export type Enquiry = {
  id: number;
  reference: string;
  received_at: string;
  updated_at: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  facility_type: string;
  location: string | null;
  message: string | null;
  estimate: Estimate | null;
  status: Status;
  notes: string | null;
};

export type EnquirySummary = Pick<
  Enquiry,
  | "id"
  | "reference"
  | "received_at"
  | "name"
  | "company"
  | "facility_type"
  | "location"
  | "estimate"
  | "status"
>;

export type EnquiryEvent = {
  id: number;
  action: "status_changed" | "notes_changed" | "deleted";
  from_status: string | null;
  to_status: string | null;
  actor_email: string | null;
  at: string;
};

const SUMMARY_COLUMNS =
  "id,reference,received_at,name,company,facility_type,location,estimate,status";
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS},updated_at,email,phone,message,notes`;

/**
 * Turns what someone typed into a safe "contains" pattern.
 * `%`, `_` and `\` are wildcards in SQL LIKE, and PostgREST also treats `*`
 * as one, so they are removed or escaped. Without this, searching for "50%"
 * would match everything.
 */
export function toSearchPattern(query: string): string | null {
  const cleaned = query
    .trim()
    .toLowerCase()
    .slice(0, 80)
    .replace(/\*/g, " ")
    .replace(/[\\%_]/g, (char) => `\\${char}`)
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? `%${cleaned}%` : null;
}

type ListOptions = { view: View; query: string; page: number };

/** Translates a dashboard view and search box into database filters. */
function filtersFor({ view, query }: Pick<ListOptions, "view" | "query">) {
  return {
    // "All" means every real enquiry: spam is only shown when asked for.
    status: view === "all" ? null : view,
    pattern: toSearchPattern(query),
  };
}

export async function listEnquiries(
  supabase: SupabaseClient,
  options: ListOptions,
): Promise<{ rows: EnquirySummary[]; total: number }> {
  const page = Math.max(1, Math.floor(options.page) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const filters = filtersFor(options);
  let request = supabase.from("enquiries").select(SUMMARY_COLUMNS, { count: "exact" });
  request = filters.status
    ? request.eq("status", filters.status)
    : request.neq("status", "spam");
  if (filters.pattern) request = request.ilike("search_text", filters.pattern);

  const { data, count, error } = await request
    .order("received_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) throw new Error(`Could not load enquiries: ${error.message}`);
  return { rows: (data ?? []) as EnquirySummary[], total: count ?? 0 };
}

/**
 * Every matching row with every column, for the CSV export.
 *
 * Read in chunks: Supabase caps a single response (1,000 rows by default), so
 * asking for everything in one request would silently drop the rest.
 */
export async function listEnquiriesForExport(
  supabase: SupabaseClient,
  options: Pick<ListOptions, "view" | "query">,
  limit = 5000,
): Promise<Enquiry[]> {
  const CHUNK = 500;
  const filters = filtersFor(options);
  const all: Enquiry[] = [];

  while (all.length < limit) {
    let request = supabase.from("enquiries").select(DETAIL_COLUMNS);
    request = filters.status
      ? request.eq("status", filters.status)
      : request.neq("status", "spam");
    if (filters.pattern) request = request.ilike("search_text", filters.pattern);

    const { data, error } = await request
      .order("received_at", { ascending: false })
      // A second sort key keeps chunks stable when two rows share a timestamp.
      .order("id", { ascending: false })
      .range(all.length, all.length + CHUNK - 1);

    if (error) throw new Error(`Could not export enquiries: ${error.message}`);
    const rows = (data ?? []) as Enquiry[];
    all.push(...rows);
    if (rows.length < CHUNK) break;
  }

  return all.slice(0, limit);
}

export async function getEnquiry(
  supabase: SupabaseClient,
  reference: string,
): Promise<Enquiry | null> {
  if (!REFERENCE_PATTERN.test(reference)) return null;

  const { data, error } = await supabase
    .from("enquiries")
    .select(DETAIL_COLUMNS)
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw new Error(`Could not load enquiry: ${error.message}`);
  return (data as Enquiry | null) ?? null;
}

export async function getEnquiryHistory(
  supabase: SupabaseClient,
  enquiryId: number,
): Promise<EnquiryEvent[]> {
  const { data, error } = await supabase
    .from("enquiry_events")
    .select("id,action,from_status,to_status,actor_email,at")
    .eq("enquiry_id", enquiryId)
    .order("at", { ascending: false })
    .range(0, 49);

  if (error) throw new Error(`Could not load history: ${error.message}`);
  return (data ?? []) as EnquiryEvent[];
}

export type StatusCounts = Record<Status, number>;

export async function getStatusCounts(supabase: SupabaseClient): Promise<StatusCounts> {
  const counts = Object.fromEntries(statusValues.map((s) => [s, 0])) as StatusCounts;

  const { data, error } = await supabase.rpc("enquiry_status_counts");
  if (error) throw new Error(`Could not load counts: ${error.message}`);

  for (const row of (data ?? []) as { status: string; total: number }[]) {
    if (row.status in counts) counts[row.status as Status] = Number(row.total);
  }
  return counts;
}
