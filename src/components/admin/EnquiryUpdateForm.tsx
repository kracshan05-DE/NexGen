"use client";

import { useActionState } from "react";
import { updateEnquiry } from "@/app/admin/actions";
import { MAX_NOTES_LENGTH, initialSaveState } from "@/lib/admin/action-state";
import { statuses, type Status } from "@/lib/admin/statuses";
import styles from "@/app/admin/admin.module.css";

export function EnquiryUpdateForm({
  reference,
  status,
  notes,
}: {
  reference: string;
  status: Status;
  notes: string;
}) {
  const [state, action, pending] = useActionState(
    updateEnquiry.bind(null, reference),
    initialSaveState,
  );

  return (
    // The key resets the fields to the saved values after each successful save.
    <form action={action} className={styles.form} key={state.status === "saved" ? state.at : "form"}>
      <div className={styles.field}>
        <label htmlFor="enquiry-status">Status</label>
        <select id="enquiry-status" name="status" defaultValue={status}>
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.hint.toLowerCase()})
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="enquiry-notes">Internal notes</label>
        <textarea
          id="enquiry-notes"
          name="notes"
          rows={6}
          maxLength={MAX_NOTES_LENGTH}
          defaultValue={notes}
          aria-describedby="enquiry-notes-hint"
        />
        <p id="enquiry-notes-hint" className={styles.hint}>
          Only staff can see these. The enquirer never does.
        </p>
      </div>
      <div className={styles.formFoot}>
        <button type="submit" className="btn btn-primary" aria-disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <span aria-live="polite" className={styles.saveState}>
          {state.status === "saved" && !pending && "Changes saved"}
          {state.status === "error" && (
            <span className={styles.saveError}>{state.message}</span>
          )}
        </span>
      </div>
    </form>
  );
}
