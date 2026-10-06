import { resolvedTestimonials } from "@/lib/flags";
import { PlaceholderNote } from "./PlaceholderNote";
import styles from "./Testimonials.module.css";

/** Renders nothing until there is at least one verified testimonial. */
export function Testimonials() {
  const { items, isPlaceholder } = resolvedTestimonials;
  if (items.length === 0) return null;

  return (
    <section
      className={`section ${styles.section}`}
      aria-labelledby="testimonials-title"
    >
      <div className="wrap">
        <div className="head">
          <p className="tag">Client stories</p>
          <h2 id="testimonials-title">What facility teams say after switching</h2>
        </div>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.quote} className={styles.card}>
              <figure>
                <span className={styles.mark} aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote>
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption className={styles.person}>
                  <b>{item.attribution}</b>
                  <span>{item.context}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {isPlaceholder && <PlaceholderNote what="these testimonials" />}
      </div>
    </section>
  );
}
