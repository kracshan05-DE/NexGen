import { processStages } from "@/content/why";
import styles from "./Process.module.css";

export function Process() {
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="wrap">
        <div className="head">
          <p className="tag">How we work</p>
          <h2 id="process-title">
            A scoped, documented process — start to finish
          </h2>
          <p>
            No guesswork and no scope creep. Every engagement follows the same
            four stages, whether it&apos;s a single deep clean or an ongoing
            facility contract.
          </p>
        </div>
        <ol className={styles.list}>
          {processStages.map((stage, index) => (
            <li key={stage.title} className={styles.item}>
              <p className={styles.step}>
                STAGE {String(index + 1).padStart(2, "0")}
              </p>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
