"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState, useTransition } from "react";
import logo from "@/assets/images/logo.png";
import { endSession } from "@/app/admin/actions";
import { site } from "@/content/site";
import {
  SESSION_HINT_COOKIE,
  SIGNED_OUT,
  type SessionState,
} from "@/lib/session-hint";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

export type NavItem = { href: string; label: string };

/*
 * Finds out whether the visitor is signed in, without slowing the page down
 * for everyone else. The page itself is a static file with "Sign in" in the
 * header. Only a browser that carries the sign-in marker cookie asks the
 * server who it is, and the header then swaps in the right controls.
 */
function useSession() {
  const [session, setSession] = useState<SessionState>(SIGNED_OUT);

  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_HINT_COOKIE}=`))) {
      return;
    }
    let cancelled = false;
    fetch("/api/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : SIGNED_OUT))
      .then((state: SessionState) => {
        if (cancelled) return;
        // The marker outlived the session (expired, or signed out elsewhere).
        if (!state.signedIn) {
          document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; path=/`;
        }
        setSession(state);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return [session, setSession] as const;
}

export function Header({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useSession();
  const [signingOut, startSignOut] = useTransition();
  const menuId = useId();

  const signOut = () =>
    startSignOut(async () => {
      await endSession();
      setSession(SIGNED_OUT);
      setOpen(false);
    });

  // Escape closes the mobile menu, as keyboard users expect.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/#top" className={styles.logo} onClick={close}>
          <Image
            src={logo}
            alt={`${site.name} — home`}
            className={styles.logoImg}
            sizes="111px"
            placeholder="empty"
            loading="eager"
          />
        </Link>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id={menuId}
          className={`${styles.links} ${open ? styles.open : ""}`}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <div className={`${styles.cta} ${session.signedIn ? styles.signedIn : ""}`}>
            <a href={site.phone.href} className={styles.phone}>
              <Icon name="phone" strokeWidth={1.8} />
              <span className="sr-only">Call </span>
              {site.phone.display}
            </a>

            {/* Account controls. The dashboard button exists only for admins. */}
            {session.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`btn ${styles.adminBtn}`}
                onClick={close}
              >
                Admin dashboard
              </Link>
            )}
            {session.signedIn ? (
              <button
                type="button"
                className={styles.accountLink}
                onClick={signOut}
                aria-disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            ) : (
              <Link
                href="/admin/login"
                className={styles.accountLink}
                onClick={close}
                prefetch={false}
              >
                Sign in
              </Link>
            )}

            <Link href="/#contact" className="btn btn-primary" onClick={close}>
              Request a quote
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
