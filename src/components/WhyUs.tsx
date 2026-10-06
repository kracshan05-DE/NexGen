import { whyUs } from "@/content/why";
import { Icon } from "./Icon";
import styles from "./WhyUs.module.css";

export function WhyUs() {
  return (
    <section
      className={`section ${styles.section}`}
      id="why"
      aria-labelledby="why-title"
    >
      <div className="wrap">
        <div className="head">
          <p className="tag">Why choose us</p>
          <h2 id="why-title">Built on documentation, not promises</h2>
          <p>
            Anyone can promise a clean facility. We back it with a written
            scope, a named contact and a paper trail for every visit.
          </p>
        </div>
        <ul className={styles.grid}>
          {whyUs.map((reason) => (
            <li key={reason.title} className={styles.card}>
              <Icon name={reason.icon} className={styles.icon} />
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
