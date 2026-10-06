import { industries } from "@/content/industries";
import { Icon } from "./Icon";
import styles from "./Industries.module.css";

export function Industries() {
  return (
    <section
      className={`section ${styles.section} on-dark`}
      id="industries"
      aria-labelledby="industries-title"
    >
      <div className="wrap">
        <div className="head">
          <p className="tag tag-on-dark">Who we serve</p>
          <h2 id="industries-title">
            Built around the operating rules of your sector
          </h2>
          <p>
            Each industry comes with its own compliance requirements, access
            windows and risk profile. Our crews are briefed and equipped
            accordingly.
          </p>
        </div>
        <ul className={styles.grid}>
          {industries.map((industry) => (
            <li key={industry.title} className={styles.card}>
              <Icon name={industry.icon} className={styles.icon} />
              <h3>{industry.title}</h3>
              <p>{industry.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
