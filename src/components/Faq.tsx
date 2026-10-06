import Link from "next/link";
import { faqs } from "@/content/faqs";
import styles from "./Faq.module.css";

/*
 * Accordion built on native <details>/<summary>.
 *
 * Why not a JavaScript accordion: the browser already provides keyboard
 * support, screen-reader semantics and find-in-page that opens the matching
 * answer. Sharing one `name` makes the group exclusive (opening one closes the
 * others), which is the behaviour of the original design. The result ships no
 * JavaScript and still works if scripts fail to load.
 */
export function Faq() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <div className="head">
          <p className="tag">Common questions</p>
          <h2 id="faq-title">Frequently asked questions</h2>
        </div>
        <div className={styles.list}>
          {faqs.map((faq) => (
            <details key={faq.question} name="faq" className={styles.item}>
              <summary className={styles.question}>
                <h3>{faq.question}</h3>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{faq.answer}</p>
            </details>
          ))}
        </div>
        <p className={styles.more}>
          Can&apos;t find your answer? <Link href="/#contact">Get in touch</Link>{" "}
          — we&apos;re happy to help.
        </p>
      </div>
    </section>
  );
}
