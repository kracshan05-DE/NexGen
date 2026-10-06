import Image from "next/image";
import { services } from "@/content/services";
import styles from "./Services.module.css";

const total = String(services.length).padStart(2, "0");

export function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="head">
          <p className="tag">What we do</p>
          <h2 id="services-title">
            Twelve specialist services, one accountable contractor
          </h2>
          <p>
            Every service is delivered by trained crews under a single scope of
            work, so facility managers deal with one point of contact instead of
            a chain of subcontractors.
          </p>
        </div>
        <ul className={styles.grid}>
          {services.map((service, index) => (
            <li key={service.slug} id={service.slug} className={styles.card}>
              <div className={styles.image}>
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px"
                  placeholder="blur"
                />
              </div>
              <div className={styles.body}>
                <p className={styles.num} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")} / {total}
                </p>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
