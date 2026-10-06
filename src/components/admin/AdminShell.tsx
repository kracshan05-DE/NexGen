import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import { signOut } from "@/app/admin/actions";
import { site } from "@/content/site";
import styles from "@/app/admin/admin.module.css";

/** Page frame for signed-in admin pages. */
export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/admin/dashboard" className={styles.brand}>
            <Image src={logo} alt={site.name} className={styles.brandLogo} sizes="97px" />
            <span className={styles.brandLabel}>Enquiries</span>
          </Link>
          <div className={styles.account}>
            <span className={styles.accountEmail} title={email}>
              {email}
            </span>
            <Link href="/" className={styles.topLink}>
              View site
            </Link>
            <form action={signOut}>
              <button type="submit" className={styles.topLink}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
    </div>
  );
}

/** Centred frame for sign-in, sign-up and notices. */
export function AuthFrame({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main id="main" tabIndex={-1} className={styles.authPage}>
      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo}>
          <Image src={logo} alt={`${site.name} — back to website`} sizes="124px" />
        </Link>
        <h1>{title}</h1>
        {intro && <p className={styles.authIntro}>{intro}</p>}
        {children}
      </div>
      {footer && <p className={styles.authFooter}>{footer}</p>}
    </main>
  );
}

export function NotConfigured() {
  return (
    <AuthFrame
      title="Sign-in is not set up yet"
      intro="This site has not been connected to its database. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to the environment variables, then redeploy. The README has the steps."
    >
      <Link href="/" className="btn btn-dark btn-block">
        Back to the website
      </Link>
    </AuthFrame>
  );
}
