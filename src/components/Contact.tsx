import Image from "next/image";
import facade from "@/assets/images/high-access-facade.jpg";
import { site } from "@/content/site";
import { privacyPageVisible } from "@/lib/flags";
import { EnquiryForm } from "./EnquiryForm";
import { Icon } from "./Icon";
import styles from "./Contact.module.css";

export function Contact() {
  return (
    <section
      className={`${styles.section} on-dark`}
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className={styles.media} aria-hidden="true">
        <Image src={facade} alt="" fill sizes="100vw" placeholder="blur" />
      </div>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <h2 id="contact-title">
            Ready to lock in a compliant, single-contract clean?
          </h2>
          <p>
            Book a free on-site assessment. No obligation, no jargon — just a
            scoped plan and a fixed price.
          </p>
          <ul className={styles.lines}>
            <li>
              <a href={site.phone.href}>
                <Icon name="phone" strokeWidth={1.8} />
                <span className="sr-only">Call </span>
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>
                <Icon name="mail" strokeWidth={1.8} />
                <span className="sr-only">Email </span>
                {site.email}
              </a>
            </li>
          </ul>
        </div>
        <EnquiryForm showPrivacyLink={privacyPageVisible} />
      </div>
    </section>
  );
}
