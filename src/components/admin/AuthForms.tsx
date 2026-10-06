"use client";

import { useActionState } from "react";
import { signIn, signUp } from "@/app/admin/actions";
import { MIN_PASSWORD_LENGTH, initialAuthState } from "@/lib/admin/action-state";
import styles from "@/app/admin/admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialAuthState);
  const email = state.status === "error" ? state.email : "";

  return (
    <form action={action} className={styles.form}>
      {state.status === "error" && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}
      <div className={styles.field}>
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={email}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block" aria-disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, initialAuthState);

  if (state.status === "check-email") {
    return (
      <div className={styles.notice} role="status">
        <h2>Check your email</h2>
        <p>
          We sent a confirmation link to <strong>{state.email}</strong>. Open it
          to confirm your address, then sign in.
        </p>
      </div>
    );
  }

  const email = state.status === "error" ? state.email : "";

  return (
    <form action={action} className={styles.form}>
      {state.status === "error" && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}
      <div className={styles.field}>
        <label htmlFor="signup-email">Email address</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          maxLength={254}
          defaultValue={email}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={72}
          aria-describedby="signup-password-hint"
        />
        <p id="signup-password-hint" className={styles.hint}>
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-confirm">Repeat password</label>
        <input
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          maxLength={72}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block" aria-disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
