"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  MAX_AREA_SQM,
  calculateEstimate,
  facilityTypes,
  formatRange,
  frequencies,
  type Estimate,
} from "@/lib/estimator";
import { useEstimate } from "./EstimateContext";
import styles from "./Estimator.module.css";

type Result =
  | { kind: "none" }
  | { kind: "invalid"; message: string }
  | { kind: "estimate"; estimate: Estimate };

export function Estimator() {
  const [result, setResult] = useState<Result>({ kind: "none" });
  const { setEstimate } = useEstimate();
  const id = useId();
  const errorId = `${id}-error`;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const area = Number(data.get("area"));

    if (!Number.isFinite(area) || area <= 0) {
      setEstimate(null);
      setResult({ kind: "invalid", message: "Enter a floor area in square metres." });
      return;
    }
    if (area > MAX_AREA_SQM) {
      setEstimate(null);
      setResult({
        kind: "invalid",
        message: `For sites over ${MAX_AREA_SQM.toLocaleString("en-AU")} sqm, please request a site assessment.`,
      });
      return;
    }

    const estimate = calculateEstimate({
      area,
      type: String(data.get("type")),
      frequency: String(data.get("frequency")),
    });
    if (!estimate) {
      setEstimate(null);
      setResult({ kind: "invalid", message: "Check the details above and try again." });
      return;
    }

    setEstimate(estimate);
    setResult({ kind: "estimate", estimate });
  }

  const invalid = result.kind === "invalid";
  const frequencySummary =
    result.kind === "estimate"
      ? frequencies.find((f) => f.value === result.estimate.frequency)?.summary
      : null;

  return (
    <section
      className={`section ${styles.section} on-dark`}
      id="estimator"
      aria-labelledby="estimator-title"
    >
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className="tag tag-on-dark">Get a ballpark figure</p>
            <h2 id="estimator-title">See what a cleaning program could cost</h2>
            <p>
              Enter your facility size and type for an indicative servicing cost.
              A free site assessment confirms the final scope and price.
            </p>
          </div>

          <form className={styles.panel} onSubmit={onSubmit} noValidate>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor={`${id}-area`}>Floor area (sqm)</label>
                <input
                  id={`${id}-area`}
                  name="area"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_AREA_SQM}
                  step="any"
                  placeholder="e.g. 1200"
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? errorId : undefined}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-type`}>Facility type</label>
                <select id={`${id}-type`} name="type" defaultValue="office">
                  {facilityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor={`${id}-frequency`}>Preferred service frequency</label>
              <select id={`${id}-frequency`} name="frequency" defaultValue="weekly">
                {frequencies.map((frequency) => (
                  <option key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={`btn btn-primary btn-block ${styles.submit}`}>
              Calculate estimate
            </button>

            {/* Announced to screen readers when the result changes. */}
            <div aria-live="polite">
              {result.kind === "invalid" && (
                <p id={errorId} className={styles.error}>
                  {result.message}
                </p>
              )}
              {result.kind === "estimate" && (
                <div className={styles.result}>
                  <p className={styles.range}>{formatRange(result.estimate.perVisit)}</p>
                  <p className={styles.sub}>Indicative cost per service visit</p>
                  <p className={styles.freq}>
                    Service frequency: <strong>{frequencySummary}</strong>
                    <br />
                    Estimated monthly range: {formatRange(result.estimate.monthly)}
                  </p>
                  <Link href="/#contact" className={`btn btn-ghost-light ${styles.next}`}>
                    Get a confirmed quote
                  </Link>
                </div>
              )}
            </div>

            <p className={styles.note}>
              This is a planning estimate only, based on typical facility rates,
              in Australian dollars. It does not account for access conditions,
              chemical requirements or compliance testing — a site assessment
              confirms final pricing.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
