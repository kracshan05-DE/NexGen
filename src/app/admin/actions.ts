"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  MAX_NOTES_LENGTH,
  MIN_PASSWORD_LENGTH,
  type AuthState,
  type SaveState,
} from "@/lib/admin/action-state";
import { REFERENCE_PATTERN } from "@/lib/admin/enquiries";
import { requireAdmin } from "@/lib/admin/session";
import { isStatus } from "@/lib/admin/statuses";
import { rateLimit } from "@/lib/rate-limit";
import { SESSION_HINT_COOKIE } from "@/lib/session-hint";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

const NOT_CONFIGURED = "Sign-in has not been set up yet.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function tooManyAttempts(bucket: string, limit: number, windowMs: number) {
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip ? !rateLimit(`${bucket}:${ip}`, { limit, windowMs }).allowed : false;
}

/* --------------------------------------------------------------------------
 * Sign in, sign up, sign out
 * ------------------------------------------------------------------------ */

/** Tells the public header that a session may exist. See SESSION_HINT_COOKIE. */
async function setSessionHint(signedIn: boolean) {
  const store = await cookies();
  if (signedIn) {
    store.set(SESSION_HINT_COOKIE, "1", {
      // Readable by the header's script on purpose; it carries no secret.
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  } else {
    store.delete(SESSION_HINT_COOKIE);
  }
}

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  const fail = (message: string): AuthState => ({ status: "error", message, email });

  if (!email || !password) return fail("Enter your email address and password.");
  if (await tooManyAttempts("signin", 10, 10 * 60 * 1000)) {
    return fail("Too many attempts. Wait a few minutes and try again.");
  }

  const supabase = await createClient();
  if (!supabase) return fail(NOT_CONFIGURED);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return fail("Confirm your email address first. The link is in the email we sent when you signed up.");
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      // One message for "no such account" and "wrong password", so the form
      // cannot be used to find out which email addresses have accounts.
      return fail("That email address or password is not correct.");
    }
    if (error.status === 429) return fail("Too many attempts. Wait a few minutes and try again.");
    console.error("[admin] sign-in failed:", error.code ?? error.status, error.message);
    return fail("Sign-in is not available right now. Try again shortly.");
  }

  // Everyone lands on the website. The header then shows an "Admin dashboard"
  // button to people whose role is admin, and nothing extra to anyone else.
  await setSessionHint(true);
  redirect("/");
}

export async function signUp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  const confirm = text(formData, "confirmPassword");
  const fail = (message: string): AuthState => ({ status: "error", message, email });

  if (!EMAIL_PATTERN.test(email) || email.length > 254) return fail("Enter a valid email address.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password.length > 72) return fail("Choose a password with 72 characters or fewer.");
  if (password !== confirm) return fail("The two passwords do not match.");
  if (await tooManyAttempts("signup", 5, 60 * 60 * 1000)) {
    return fail("Too many attempts. Try again in an hour.");
  }

  const supabase = await createClient();
  if (!supabase) return fail(NOT_CONFIGURED);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Where the confirmation email's link lands. This URL must be listed under
    // Authentication → URL Configuration → Redirect URLs in Supabase.
    options: { emailRedirectTo: `${getSiteUrl()}/admin/login?confirmed=1` },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return fail("An account with this email address already exists. Sign in instead.");
    }
    if (error.code === "signup_disabled") {
      return fail("New accounts are switched off. Ask an administrator for access.");
    }
    if (error.code === "weak_password") return fail("Choose a stronger password.");
    if (error.status === 429) return fail("Too many attempts. Try again later.");
    console.error("[admin] sign-up failed:", error.code ?? error.status, error.message);
    return fail("The account could not be created. Try again shortly.");
  }

  // Email confirmation switched off in Supabase: the person is signed in
  // already, as a normal account with role = user.
  if (data.session) {
    await setSessionHint(true);
    redirect("/");
  }

  return { status: "check-email", email };
}

/** Ends the session without navigating. Used by the public header. */
export async function endSession(): Promise<void> {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  await setSessionHint(false);
}

/** Ends the session and returns to the website. Used inside the admin area. */
export async function signOut(): Promise<void> {
  await endSession();
  redirect("/");
}

/* --------------------------------------------------------------------------
 * Enquiries
 * Each action re-checks that the caller has the admin role. The database
 * checks again, so even a bug here could not expose or change enquiries.
 * ------------------------------------------------------------------------ */

export async function updateEnquiry(
  reference: string,
  _previous: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const { supabase } = await requireAdmin();

  const status = text(formData, "status");
  const notes = text(formData, "notes").replace(/\r\n?/g, "\n").trim();

  if (!REFERENCE_PATTERN.test(reference)) return { status: "error", message: "Unknown enquiry." };
  if (!isStatus(status)) return { status: "error", message: "Choose a status." };
  if (notes.length > MAX_NOTES_LENGTH) {
    return { status: "error", message: `Keep notes under ${MAX_NOTES_LENGTH.toLocaleString("en-AU")} characters.` };
  }

  const { data, error } = await supabase
    .from("enquiries")
    .update({ status, notes: notes || null })
    .eq("reference", reference)
    .select("id");

  if (error) {
    console.error("[admin] update failed:", error.message);
    return { status: "error", message: "The change could not be saved. Try again." };
  }
  // Zero rows back means it no longer exists, or the database refused access.
  if (!data || data.length === 0) {
    return { status: "error", message: "This enquiry no longer exists." };
  }

  revalidatePath("/admin", "layout");
  return { status: "saved", at: Date.now() };
}

export async function deleteEnquiry(reference: string): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!REFERENCE_PATTERN.test(reference)) redirect("/admin/dashboard");

  const { data, error } = await supabase
    .from("enquiries")
    .delete()
    .eq("reference", reference)
    .select("id");

  if (error || !data || data.length === 0) {
    if (error) console.error("[admin] delete failed:", error.message);
    redirect(`/admin/enquiries/${reference}?error=delete`);
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/dashboard?deleted=${reference}`);
}
