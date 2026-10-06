import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEnquiry } from "@/app/admin/actions";
import { AdminShell, NotConfigured } from "@/components/admin/AdminShell";
import { EnquiryUpdateForm } from "@/components/admin/EnquiryUpdateForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Icon } from "@/components/Icon";
import {
  getEnquiry,
  getEnquiryHistory,
  type EnquiryEvent,
} from "@/lib/admin/enquiries";
import { formatDateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";
import { statusLabel } from "@/lib/admin/statuses";
import { facilityLabel, formatRange, frequencyLabel } from "@/lib/estimator";
import { isAdminConfigured } from "@/lib/supabase/config";
import styles from "../../admin.module.css";

export const metadata: Metadata = { title: "Enquiry" };

function describeEvent(event: EnquiryEvent): string {
  if (event.action === "status_changed") {
    return `Status changed from ${statusLabel(event.from_status ?? "")} to ${statusLabel(event.to_status ?? "")}`;
  }
  if (event.action === "notes_changed") return "Notes updated";
  return "Deleted";
}

export default async function EnquiryPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isAdminConfigured()) return <NotConfigured />;
  const { supabase, user } = await requireAdmin();

  const { reference } = await params;
  const { error } = await searchParams;

  const enquiry = await getEnquiry(supabase, reference);
  if (!enquiry) notFound();
  const history = await getEnquiryHistory(supabase, enquiry.id);

  const replySubject = encodeURIComponent(`Your enquiry to Nexgen Facility Management [${enquiry.reference}]`);
  const estimate = enquiry.estimate;

  return (
    <AdminShell email={user.email ?? ""}>
      <Link href="/admin/dashboard" className={styles.back}>
        Back to all enquiries
      </Link>

      {error === "delete" && (
        <p className={styles.formError} role="alert">
          This enquiry could not be deleted. Try again.
        </p>
      )}

      <div className={styles.detailHead}>
        <div>
          <h1>{enquiry.name}</h1>
          {enquiry.company && <p className={styles.detailCompany}>{enquiry.company}</p>}
        </div>
        <StatusBadge status={enquiry.status} />
      </div>
      <p className={styles.detailMeta}>
        <span>
          Received <time dateTime={enquiry.received_at}>{formatDateTime(enquiry.received_at)}</time>
        </span>
        <span className={styles.ref}>{enquiry.reference}</span>
      </p>

      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <section className={styles.panel} aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contact</h2>
            <div className={styles.quick}>
              <a href={`mailto:${enquiry.email}?subject=${replySubject}`} className="btn btn-dark">
                <Icon name="mail" strokeWidth={1.8} width={16} height={16} />
                Reply by email
              </a>
              <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} className={`btn ${styles.btnQuiet}`}>
                <Icon name="phone" strokeWidth={1.8} width={16} height={16} />
                Call {enquiry.phone}
              </a>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Email</dt>
                <dd>{enquiry.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{enquiry.phone}</dd>
              </div>
              <div>
                <dt>Facility type</dt>
                <dd>{facilityLabel(enquiry.facility_type)}</dd>
              </div>
              <div>
                <dt>Site suburb or postcode</dt>
                <dd>{enquiry.location ?? <span className={styles.none}>Not given</span>}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.panel} aria-labelledby="message-heading">
            <h2 id="message-heading">Message</h2>
            {enquiry.message ? (
              <p className={styles.message}>{enquiry.message}</p>
            ) : (
              <p className={styles.none}>No message was written.</p>
            )}
          </section>

          {estimate && (
            <section className={styles.panel} aria-labelledby="estimate-heading">
              <h2 id="estimate-heading">Estimate they saw on the website</h2>
              <dl className={styles.facts}>
                <div>
                  <dt>Floor area</dt>
                  <dd>{estimate.area.toLocaleString("en-AU")} sqm</dd>
                </div>
                <div>
                  <dt>Service frequency</dt>
                  <dd>{frequencyLabel(estimate.frequency)}</dd>
                </div>
                <div>
                  <dt>Per visit</dt>
                  <dd>{formatRange(estimate.perVisit)}</dd>
                </div>
                <div>
                  <dt>Per month</dt>
                  <dd>{formatRange(estimate.monthly)}</dd>
                </div>
              </dl>
              <p className={styles.hint}>
                Indicative only. This is the range the website calculator showed
                them, not a quote.
              </p>
            </section>
          )}

          <section className={styles.panel} aria-labelledby="history-heading">
            <h2 id="history-heading">History</h2>
            <ol className={styles.history}>
              {history.map((event) => (
                <li key={event.id}>
                  <span>{describeEvent(event)}</span>
                  <span className={styles.sub}>
                    {event.actor_email ?? "System"}, {formatDateTime(event.at)}
                  </span>
                </li>
              ))}
              <li>
                <span>Enquiry received from the website</span>
                <span className={styles.sub}>{formatDateTime(enquiry.received_at)}</span>
              </li>
            </ol>
          </section>
        </div>

        <aside className={styles.detailSide} aria-label="Manage this enquiry">
          <section className={styles.panel} aria-labelledby="update-heading">
            <h2 id="update-heading">Update</h2>
            <EnquiryUpdateForm
              reference={enquiry.reference}
              status={enquiry.status}
              notes={enquiry.notes ?? ""}
            />
          </section>

          <details className={styles.danger}>
            <summary>Delete this enquiry</summary>
            <p>
              This permanently removes {enquiry.name}&apos;s details. It cannot
              be undone. Use it for privacy requests; for junk, set the status
              to Spam instead.
            </p>
            <form action={deleteEnquiry.bind(null, enquiry.reference)}>
              <button type="submit" className={`btn ${styles.btnDanger}`}>
                Delete permanently
              </button>
            </form>
          </details>
        </aside>
      </div>
    </AdminShell>
  );
}
