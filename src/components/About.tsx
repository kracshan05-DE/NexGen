import Image from "next/image";
import Link from "next/link";
import serverHall from "@/assets/images/server-hall.jpg";
import { site } from "@/content/site";
import styles from "./About.module.css";

export function About() {
  const tab = site.established
    ? `EST. ${site.established} — NATIONAL COVERAGE`
    : "NATIONAL COVERAGE";

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.media}>
            <Image
              src={serverHall}
              alt="Server hall with rows of racks and a polished raised floor"
              sizes="(max-width: 860px) 100vw, 560px"
              placeholder="blur"
            />
            <div className={styles.tab}>{tab}</div>
          </div>
          <div className={styles.copy}>
            <p className="tag">Who we are</p>
            <h2 id="about-title">
              Cleaning delivered like an operations discipline, not a favour.
            </h2>
            <p>
              At Nexgen Facility Management, we treat cleaning and maintenance
              as part of how a building runs — not an afterthought squeezed in
              after hours. We pair trained, compliance-briefed crews with a
              written scope of work, so every visit is repeatable and every
              result is documented.
            </p>
            <p>
              From data halls and laboratories to warehouses, retail and
              body-corporate portfolios, the discipline stays the same: one
              scope, one point of contact, and reporting you can hand straight
              to your compliance file.
            </p>
            <Link href="/#contact" className="btn btn-dark">
              Start the conversation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
