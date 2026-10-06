import Image from "next/image";
import { resolvedPartners } from "@/lib/flags";
import type { Partner } from "@/content/social-proof";
import { Icon } from "./Icon";
import { PlaceholderNote } from "./PlaceholderNote";
import styles from "./Partners.module.css";

function PartnerMark({ partner }: { partner: Partner }) {
  if (partner.logo) {
    return (
      <Image
        src={partner.logo}
        alt={partner.name}
        className={styles.logoImg}
        sizes="160px"
      />
    );
  }
  return (
    <>
      {partner.glyph && (
        <Icon
          name={partner.glyph}
          strokeWidth={1.6}
          style={{ color: partner.glyphColour }}
        />
      )}
      <span className={styles.text}>
        {partner.name}
        {partner.descriptor && <small>{partner.descriptor}</small>}
      </span>
    </>
  );
}

/** Renders nothing until there is at least one partner to show. */
export function Partners() {
  const { items, isPlaceholder } = resolvedPartners;
  if (items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="partners-title">
      <div className="wrap">
        <div className={styles.head}>
          <p className={styles.badge}>Our Partners</p>
          <h2 id="partners-title">Trusted by facility and property teams</h2>
          <p>We partner with industry-leading organisations across Australia</p>
          {isPlaceholder && <PlaceholderNote what="these partner names" />}
        </div>
      </div>

      <div className={styles.runner}>
        <ul className={styles.track}>
          {items.map((partner) => (
            <li key={partner.name} className={styles.item}>
              <PartnerMark partner={partner} />
            </li>
          ))}
          {/* Second copy makes the loop seamless; hidden from assistive tech. */}
          {items.map((partner) => (
            <li
              key={`${partner.name}-repeat`}
              className={`${styles.item} ${styles.repeat}`}
              aria-hidden="true"
            >
              <PartnerMark partner={partner} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
