import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { privacyPageVisible } from "@/lib/flags";
import type { NavItem } from "./Header";
import { Icon } from "./Icon";
import styles from "./Footer.module.css";

const footerServices = services.filter((service) => service.footerLabel);

const socials = [
  { name: "LinkedIn", icon: "linkedin", href: site.social.linkedin },
  { name: "Facebook", icon: "facebook", href: site.social.facebook },
] as const;

export function Footer({ items }: { items: NavItem[] }) {
  const activeSocials = socials.filter((social) => social.href);
  // Evaluated when the site is built. Any deploy in a new year refreshes it.
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/#top" className={styles.logo}>
              <Image
                src={logo}
                alt={`${site.name} — home`}
                className={styles.logoImg}
                sizes="97px"
              />
            </Link>
            <p>{site.summary}</p>
            {activeSocials.length > 0 && (
              <ul className={styles.social}>
                {activeSocials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href!}
                      aria-label={`${site.shortName} on ${social.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name={social.icon} strokeWidth={1.6} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className={styles.col} aria-labelledby="footer-quick-links">
            <h2 id="footer-quick-links">QUICK LINKS</h2>
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-labelledby="footer-services">
            <h2 id="footer-services">SERVICES</h2>
            <ul>
              {footerServices.map((service) => (
                <li key={service.slug}>
                  <Link href={`/#${service.slug}`}>{service.footerLabel}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h2>READY TO START?</h2>
            <div className={styles.cta}>
              <p>
                Book a free site assessment and get a fixed-scope, fixed-fee
                quote within 48 hours.
              </p>
              <Link href="/#contact" className="btn btn-dark btn-block">
                Request a quote
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {site.legalName}.{site.abn && ` ABN ${site.abn}.`}
            {privacyPageVisible && (
              <>
                {" "}
                <Link href="/privacy">Privacy policy</Link>
              </>
            )}
          </p>
          <p>{site.cities.join(", ")}</p>
        </div>
      </div>
    </footer>
  );
}
