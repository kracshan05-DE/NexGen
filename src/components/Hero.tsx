import Image from "next/image";
import Link from "next/link";
import fallbackImage from "@/assets/images/service-warehouse-cleaning.jpg";
import { heroChecks, stats } from "@/content/site";
import { heroMedia } from "@/lib/hero-media";
import { Icon } from "./Icon";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={`${styles.hero} on-dark`} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        {/*
          The still image is always rendered: it is the Largest Contentful Paint
          candidate, the poster while a video buffers, and what visitors who
          prefer reduced motion see. `preload` asks the browser to fetch it
          before it has even parsed the stylesheet.
        */}
        {heroMedia.poster ? (
          <Image
            src={heroMedia.poster}
            alt=""
            fill
            preload
            sizes="100vw"
            className={styles.still}
          />
        ) : (
          <Image
            src={fallbackImage}
            alt=""
            fill
            preload
            sizes="100vw"
            placeholder="blur"
            className={styles.still}
          />
        )}
        {heroMedia.video && (
          // No `poster` attribute: the optimised still above already sits
          // behind the video and shows until the first frame is ready.
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={heroMedia.video} type="video/mp4" />
          </video>
        )}
      </div>

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.badge}>Real facility support starts here</p>
          <h1 id="hero-title">
            <span className={styles.line1}>
              Facility cleaning and maintenance,
            </span>{" "}
            <span className={styles.line2}>
              run like a <span className={styles.hl}>compliance program.</span>
            </span>
          </h1>
          <p className={styles.sub}>
            From server halls to ISO-classified cleanrooms, Nexgen keeps
            Australia&apos;s most demanding facilities compliant, safe and
            spotless — without interrupting how they run.
          </p>
          <ul className={styles.checks}>
            {heroChecks.map((item) => (
              <li key={item}>
                <Icon name="check" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Link href="/#contact" className="btn btn-primary">
              Request a site assessment
            </Link>
            <Link href="/#services" className="btn btn-ghost-light">
              View our services
            </Link>
          </div>
        </div>
      </div>

      <dl className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            {/* <dt> must precede <dd> in the DOM; CSS shows the number on top. */}
            <dt className={styles.lbl}>{stat.label}</dt>
            <dd className={styles.num}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
