import { NextResponse, type NextRequest } from "next/server";
import { listEnquiriesForExport } from "@/lib/admin/enquiries";
import { formatDateTime, toCsv } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";
import { parseView, statusLabel } from "@/lib/admin/statuses";
import { facilityLabel, formatRange, frequencyLabel } from "@/lib/estimator";
import { isAdminConfigured } from "@/lib/supabase/config";

/** Downloads the current dashboard view as a spreadsheet-ready CSV file. */
export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) return new NextResponse("Not configured", { status: 503 });
  const { supabase } = await requireAdmin();

  const params = request.nextUrl.searchParams;
  const view = parseView(params.get("status"));
  const query = (params.get("q") ?? "").trim().slice(0, 80);

  const rows = await listEnquiriesForExport(supabase, { view, query });

  const csv = toCsv(
    [
      "Reference",
      "Received",
      "Status",
      "Name",
      "Company",
      "Email",
      "Phone",
      "Facility type",
      "Site suburb or postcode",
      "Message",
      "Estimate floor area (sqm)",
      "Estimate frequency",
      "Estimate per visit",
      "Estimate per month",
      "Internal notes",
    ],
    rows.map((row) => [
      row.reference,
      formatDateTime(row.received_at),
      statusLabel(row.status),
      row.name,
      row.company,
      row.email,
      row.phone,
      facilityLabel(row.facility_type),
      row.location,
      row.message,
      row.estimate?.area,
      row.estimate ? frequencyLabel(row.estimate.frequency) : null,
      row.estimate ? formatRange(row.estimate.perVisit) : null,
      row.estimate ? formatRange(row.estimate.monthly) : null,
      row.notes,
    ]),
  );

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexgen-enquiries-${date}.csv"`,
      // Personal information: never store this response in any cache.
      "Cache-Control": "private, no-store",
    },
  });
}
