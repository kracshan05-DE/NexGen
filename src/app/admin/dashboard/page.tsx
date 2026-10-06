import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell, NotConfigured } from "@/components/admin/AdminShell";
import { StatusBadge, StatusMark } from "@/components/admin/StatusBadge";
import {
  PAGE_SIZE,
  REFERENCE_PATTERN,
  getStatusCounts,
  listEnquiries,
} from "@/lib/admin/enquiries";
import { formatDateTime, formatReceived } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";
import { parseView, pipeline, statusLabel, type View } from "@/lib/admin/statuses";
import { facilityLabel, formatRange } from "@/lib/estimator";
import { isAdminConfigured } from "@/lib/supabase/config";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Enquiries" };

type Search = { status?: string; q?: string; page?: string; deleted?: string };

function hrefFor(view: View, query: string, page = 1): string {
  const params = new URLSearchParams();
  if (view !== "all") params.set("status", view);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/dashboard?${search}` : "/admin/dashboard";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!isAdminConfigured()) return <NotConfigured />;
  const { supabase, user } = await requireAdmin();

  const params = await searchParams;
  const view = parseView(params.status);
  const query = (params.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const deleted = params.deleted && REFERENCE_PATTERN.test(params.deleted) ? params.deleted : null;

  const [counts, { rows, total }] = await Promise.all([
    getStatusCounts(supabase),
    listEnquiries(supabase, { view, query, page }),
  ]);

  const realTotal = pipeline.reduce((sum, s) => sum + counts[s], 0) + counts.lost;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(total, page * PAGE_SIZE);
  const filtered = view !== "all" || query !== "";
  const exportHref = hrefFor(view, query).replace("/admin/dashboard", "/admin/export");

  return (
    <AdminShell email={user.email ?? ""}>
      {deleted && (
        <p className={styles.flash} role="status">
          Enquiry <span className={styles.ref}>{deleted}</span> was deleted.
        </p>
      )}

      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.lead}>
            <span className={styles.leadFigure}>{counts.new}</span>
            <span className={styles.leadText}>
              {counts.new === 1 ? "new enquiry" : "new enquiries"} waiting for a
              reply
            </span>
          </h1>
        </div>
        <a href={exportHref} className={`btn ${styles.btnQuiet}`} download>
          Export CSV
        </a>
      </div>

      {/* The pipeline is a real sequence, so it is drawn as one. */}
      <nav aria-label="Filter by stage">
        <ol className={styles.pipeline}>
          {pipeline.map((stage) => (
            <li key={stage}>
              <Link
                href={hrefFor(stage, query)}
                className={styles.stage}
                aria-current={view === stage ? "true" : undefined}
              >
                <span className={styles.stageLabel}>
                  <StatusMark status={stage} />
                  {statusLabel(stage)}
                </span>
                <span className={styles.stageCount}>{counts[stage]}</span>
              </Link>
            </li>
          ))}
        </ol>
        <ul className={styles.otherViews}>
          <li>
            <Link href={hrefFor("all", query)} aria-current={view === "all" ? "true" : undefined}>
              All enquiries <span>{realTotal}</span>
            </Link>
          </li>
          <li>
            <Link href={hrefFor("lost", query)} aria-current={view === "lost" ? "true" : undefined}>
              Lost <span>{counts.lost}</span>
            </Link>
          </li>
          <li>
            <Link href={hrefFor("spam", query)} aria-current={view === "spam" ? "true" : undefined}>
              Spam <span>{counts.spam}</span>
            </Link>
          </li>
        </ul>
      </nav>

      <form action="/admin/dashboard" method="get" className={styles.search} role="search">
        {view !== "all" && <input type="hidden" name="status" value={view} />}
        <label htmlFor="enquiry-search" className="sr-only">
          Search enquiries
        </label>
        <input
          id="enquiry-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name, company, email, phone, suburb or reference"
          maxLength={80}
        />
        <button type="submit" className="btn btn-dark">
          Search
        </button>
        {query && (
          <Link href={hrefFor(view, "")} className={styles.clear}>
            Clear search
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className={styles.empty}>
          {filtered ? (
            <>
              <h2>No enquiries match</h2>
              <p>
                Nothing found
                {query && (
                  <>
                    {" "}
                    for <strong>&ldquo;{query}&rdquo;</strong>
                  </>
                )}
                {view !== "all" && <> in {statusLabel(view)}</>}.
              </p>
              <Link href="/admin/dashboard" className="btn btn-dark">
                Show all enquiries
              </Link>
            </>
          ) : (
            <>
              <h2>No enquiries yet</h2>
              <p>
                When someone sends the form on the website, their enquiry
                appears here.
              </p>
              <Link href="/#contact" className="btn btn-dark">
                Open the enquiry form
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {/*
            Each row is a single link, so the whole row is clickable and
            keyboard users get one tab stop per enquiry.
          */}
          <div className={styles.ledger}>
            <div className={styles.ledgerHead} aria-hidden="true">
              <span>Received</span>
              <span>From</span>
              <span>Facility</span>
              <span>Estimate per month</span>
              <span>Status</span>
            </div>
            <ol aria-label={`${view === "all" ? "All" : statusLabel(view)} enquiries, newest first`}>
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/admin/enquiries/${row.reference}`}
                    className={`${styles.row} ${row.status === "new" ? styles.isNew : ""}`}
                  >
                    <time
                      className={styles.cellDate}
                      dateTime={row.received_at}
                      title={formatDateTime(row.received_at)}
                    >
                      {formatReceived(row.received_at)}
                    </time>
                    <span className={styles.cellFrom}>
                      <span className={styles.name}>{row.name}</span>
                      {row.company && <span className={styles.sub}>{row.company}</span>}
                    </span>
                    <span className={styles.cellFacility}>
                      {facilityLabel(row.facility_type)}
                      {row.location && <span className={styles.sub}>{row.location}</span>}
                    </span>
                    <span className={styles.cellNumber}>
                      <span className={styles.cellLabel}>Estimate per month </span>
                      {row.estimate ? (
                        formatRange(row.estimate.monthly)
                      ) : (
                        <span className={styles.none}>None</span>
                      )}
                    </span>
                    <span className={styles.cellStatus}>
                      <StatusBadge status={row.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.pager}>
            <p>
              Showing {first}–{last} of {total}
            </p>
            {pageCount > 1 && (
              <nav aria-label="Pages" className={styles.pagerLinks}>
                {page > 1 ? (
                  <Link href={hrefFor(view, query, page - 1)} rel="prev">
                    Newer
                  </Link>
                ) : (
                  <span aria-disabled="true">Newer</span>
                )}
                <span>
                  Page {page} of {pageCount}
                </span>
                {page < pageCount ? (
                  <Link href={hrefFor(view, query, page + 1)} rel="next">
                    Older
                  </Link>
                ) : (
                  <span aria-disabled="true">Older</span>
                )}
              </nav>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}
