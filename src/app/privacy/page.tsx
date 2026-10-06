import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/content/site";
import { privacyPageVisible } from "@/lib/flags";
import { navItems } from "@/lib/nav";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the details you send through this website.`,
  alternates: { canonical: "/privacy" },
};

/*
 * DRAFT — this wording describes what the website technically does with
 * enquiry data. It is not legal advice. The client must review and approve it
 * (see `site.legal.privacyPolicyApproved`) before it is published.
 *
 * If analytics, advertising pixels or any other tracking is added to the site
 * later, the "Cookies and tracking" section must be updated to match.
 */
export default function PrivacyPage() {
  if (!privacyPageVisible) notFound();

  return (
    <>
      <Header items={navItems} />
      <main id="main" tabIndex={-1} className={styles.main}>
        <div className={`wrap ${styles.wrap}`}>
          {!site.legal.privacyPolicyApproved && (
            <p className="placeholder-note" role="note">
              Preview only — draft wording awaiting approval. This page is not
              published on the live site until it is approved.
            </p>
          )}
          <h1>Privacy policy</h1>
          <p className={styles.lead}>
            This policy explains what {site.legalName} (&ldquo;Nexgen&rdquo;,
            &ldquo;we&rdquo;) collects through this website and what we do with
            it.
          </p>

          <h2>What we collect</h2>
          <p>
            We collect only what you choose to send us through the enquiry form:
            your name, company, email address, phone number, facility type, site
            suburb or postcode, and any message you write. If you use the cost
            estimator before enquiring, the floor area and service frequency you
            entered are sent with your enquiry.
          </p>

          <h2>How we use it</h2>
          <p>
            We use these details to respond to your enquiry, arrange a site
            assessment and prepare a quote. We do not sell your details or use
            them for unrelated marketing.
          </p>

          <h2>Where it is stored</h2>
          <p>
            Your enquiry is saved in a secure database. Only Nexgen staff who
            have been given administrator access can read it, and we keep a
            record of changes made to each enquiry. Our team may also be
            notified by email when an enquiry arrives. We use third-party
            providers for website hosting, database hosting and email delivery.
            Some of these providers store or process data on servers outside
            Australia.
          </p>

          <h2>Cookies and tracking</h2>
          <p>
            This website does not set advertising or analytics cookies and does
            not use third-party tracking scripts. The only cookies it uses keep a
            person signed in after they choose to sign in; visitors who do not
            sign in do not receive them.
          </p>

          <h2>Access, correction and complaints</h2>
          <p>
            You can ask us for a copy of the details we hold about you, ask us
            to correct them, or ask us to delete them. Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
            <a href={site.phone.href}>{site.phone.display}</a>. If you are not
            satisfied with our response, you can contact the Office of the
            Australian Information Commissioner at oaic.gov.au.
          </p>
        </div>
      </main>
      <Footer items={navItems} />
    </>
  );
}
