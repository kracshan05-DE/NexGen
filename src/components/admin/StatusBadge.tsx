import { statusLabel, type Status } from "@/lib/admin/statuses";
import styles from "@/app/admin/admin.module.css";

/*
 * Each status has its own SHAPE as well as its own colour, and always carries
 * its name. Colour alone would fail anyone who is colour-blind or reading a
 * black-and-white printout.
 */
const marks: Record<Status, React.ReactNode> = {
  new: <rect x="2" y="2" width="8" height="8" fill="currentColor" />,
  contacted: <circle cx="6" cy="6" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />,
  quoted: <circle cx="6" cy="6" r="4.4" fill="currentColor" />,
  won: <path d="M1.8 6.4 4.7 9.2 10.2 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  lost: <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  spam: <path d="M2 6h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
};

export function StatusMark({ status }: { status: Status }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      aria-hidden="true"
      focusable="false"
      className={`${styles.mark} ${styles[`mark_${status}`]}`}
    >
      {marks[status]}
    </svg>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={styles.badge}>
      <StatusMark status={status} />
      {statusLabel(status)}
    </span>
  );
}
