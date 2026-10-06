"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { submitEnquiry } from "@/app/actions/enquiry";
import { site } from "@/content/site";
import {
  HONEYPOT_FIELD,
  cleanEnquiry,
  enquiryFields,
  initialEnquiryState,
  limits,
  requiredFields,
  validateEnquiry,
  validateField,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryValues,
} from "@/lib/enquiry";
import { describeEstimate, facilityTypes } from "@/lib/estimator";
import { useEstimate } from "./EstimateContext";
import styles from "./EnquiryForm.module.css";

const isEnquiryField = (name: string): name is EnquiryField =>
  (enquiryFields as readonly string[]).includes(name);

/** False while the server-rendered HTML is showing, true once React is running. */
const subscribeToNothing = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(subscribeToNothing, () => true, () => false);

export function EnquiryForm({ showPrivacyLink }: { showPrivacyLink: boolean }) {
  const [state, formAction, pending] = useActionState(
    submitEnquiry,
    initialEnquiryState,
  );
  const { estimate, setEstimate } = useEstimate();
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();

  /*
   * Validation runs in two places with the same rules (src/lib/enquiry.ts):
   * here, as the visitor leaves each field and again when they press submit,
   * and on the server, which has the final say. `errors` holds whichever
   * answer is newest.
   */
  // Start from the server's answer when there is one. Without JavaScript the
  // page is rendered once, on the server, with that answer already known.
  const [errors, setErrors] = useState<EnquiryErrors>(
    state.status === "error" ? state.fieldErrors : {},
  );
  const [summary, setSummary] = useState<string | null>(
    state.status === "error" ? state.message : null,
  );

  // When the server answers, adopt its verdict.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") {
      setErrors(state.fieldErrors);
      setSummary(state.message);
    }
  }

  const values = state.status === "error" ? state.values : {};

  /** Checks one field and shows or clears its message. */
  const checkField = (name: EnquiryField, rawValue: string) => {
    const problem = validateField(name, cleanEnquiry({ [name]: rawValue })[name]);
    setErrors((current) => {
      if ((current[name] ?? null) === problem) return current;
      const next = { ...current };
      if (problem) next[name] = problem;
      else delete next[name];
      return next;
    });
  };

  const focusField = (name: EnquiryField) => {
    const target = formRef.current?.elements.namedItem(name);
    if (target instanceof HTMLElement) target.focus();
  };

  // Facility type is the one field the estimator can pre-fill, so it is
  // controlled. When a new estimate arrives, adopt its facility type.
  const [facilityType, setFacilityType] = useState("");
  const [seenEstimate, setSeenEstimate] = useState(estimate);
  if (estimate !== seenEstimate) {
    setSeenEstimate(estimate);
    if (estimate) setFacilityType(estimate.type);
  }

  // Changing the facility type by hand makes the attached estimate stale.
  const estimateApplies = estimate !== null && estimate.type === facilityType;

  // After each response, move focus to where the visitor needs to act.
  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
    } else if (state.status === "error") {
      const firstInvalid = enquiryFields.find((field) => state.fieldErrors[field]);
      if (firstInvalid) {
        const target = formRef.current?.elements.namedItem(firstInvalid);
        if (target instanceof HTMLElement) target.focus();
      }
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className={`${styles.panel} ${styles.success}`}
        role="status"
      >
        <h3>Thanks — your enquiry is in.</h3>
        <p>
          We&apos;ve received your details and will be in touch to arrange your
          site assessment.
        </p>
        <p className={styles.reference}>
          Reference <strong>{state.reference}</strong>
        </p>
        <p>
          Need a faster response? Call{" "}
          <a href={site.phone.href}>{site.phone.display}</a>.
        </p>
      </div>
    );
  }

  const field = (name: EnquiryField) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  /*
   * The message line under a field. For required fields the line is always
   * there, empty until needed, so the form does not change height when a
   * message appears. Otherwise this happens: you click the submit button, the
   * field you just left shows its message, the button moves down a line
   * between the press and the release of the mouse, and the click is lost.
   */
  const errorFor = (name: EnquiryField) =>
    errors[name] || requiredFields.includes(name) ? (
      <p id={`${id}-${name}-error`} className={styles.error}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      // Without JavaScript the browser posts the form to the server action
      // directly (progressive enhancement). With JavaScript, onSubmit sends it
      // instead: React resets a form after an `action` submit, which would
      // wipe the visitor's typing whenever the server returns an error.
      action={formAction}
      // Once React is running, our own messages replace the browser's pop-up
      // bubbles. Before that (or with JavaScript off) the browser's built-in
      // checks still apply, and the server validates either way.
      noValidate={hydrated}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);

        const entered = Object.fromEntries(
          enquiryFields.map((name) => [name, String(data.get(name) ?? "")]),
        ) as EnquiryValues;
        const result = validateEnquiry(entered);
        if (!result.ok) {
          setErrors(result.errors);
          setSummary("Please check the highlighted fields and try again.");
          const firstInvalid = enquiryFields.find((name) => result.errors[name]);
          if (firstInvalid) focusField(firstInvalid);
          return;
        }

        setErrors({});
        setSummary(null);
        startTransition(() => formAction(data));
      }}
      // Leaving a field checks it. React's onBlur bubbles, so one handler on
      // the form covers every input.
      onBlur={(event) => {
        const { name, value } = event.target as unknown as HTMLInputElement;
        if (isEnquiryField(name)) checkField(name, value);
      }}
      // While a field is showing a message, re-check it on every keystroke so
      // the message disappears the moment the value becomes valid.
      onChange={(event) => {
        const { name, value } = event.target as unknown as HTMLInputElement;
        if (isEnquiryField(name) && errors[name]) checkField(name, value);
      }}
      className={styles.panel}
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className={styles.title}>
        Request a site assessment
      </h3>
      <p className={styles.hint}>
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {/* Always in the page so screen readers announce it when it fills. */}
      <div role="alert">
        {summary && <p className={styles.formError}>{summary}</p>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            {...field("name")}
            type="text"
            autoComplete="name"
            required
            maxLength={limits.name}
            defaultValue={values.name}
          />
          {errorFor("name")}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-company`}>Company</label>
          <input
            {...field("company")}
            type="text"
            autoComplete="organization"
            maxLength={limits.company}
            defaultValue={values.company}
          />
          {errorFor("company")}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={limits.email}
            defaultValue={values.email}
          />
          {errorFor("email")}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-phone`}>
            Phone <span aria-hidden="true">*</span>
          </label>
          <input
            {...field("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={limits.phone}
            defaultValue={values.phone}
          />
          {errorFor("phone")}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-facilityType`}>
            Facility type <span aria-hidden="true">*</span>
          </label>
          <select
            {...field("facilityType")}
            required
            value={facilityType}
            onChange={(event) => setFacilityType(event.target.value)}
          >
            <option value="" disabled>
              Select…
            </option>
            {facilityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
          {errorFor("facilityType")}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-location`}>Site suburb or postcode</label>
          <input
            {...field("location")}
            type="text"
            maxLength={limits.location}
            defaultValue={values.location}
          />
          {errorFor("location")}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-message`}>Anything we should know?</label>
        <textarea
          {...field("message")}
          rows={4}
          maxLength={limits.message}
          defaultValue={values.message}
        />
        {errorFor("message")}
      </div>

      {estimateApplies && (
        <div className={styles.estimate}>
          <p>
            <span className={styles.estimateLabel}>Estimate attached</span>
            {describeEstimate(estimate)}
          </p>
          <button type="button" onClick={() => setEstimate(null)}>
            Remove
          </button>
          {/* Only the inputs are sent; the server recalculates the figures. */}
          <input type="hidden" name="estimateArea" value={estimate.area} />
          <input type="hidden" name="estimateFrequency" value={estimate.frequency} />
        </div>
      )}

      {/* Honeypot: invisible to people, irresistible to form-filling bots. */}
      <div className={styles.hp} aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        aria-disabled={pending}
      >
        {pending ? "Sending…" : "Request a site assessment"}
      </button>

      <p className={styles.privacy}>
        We use these details only to respond to your enquiry.
        {showPrivacyLink && (
          <>
            {" "}
            See our <Link href="/privacy">privacy policy</Link>.
          </>
        )}
      </p>
    </form>
  );
}
