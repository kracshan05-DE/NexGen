/**
 * Supabase settings for staff sign-in and the admin dashboard.
 *
 * Two different keys are in play, and they do different jobs:
 *   - PUBLISHABLE key (used here): identifies the project. On its own it can
 *     do nothing with enquiries; the database only answers once a signed-in
 *     admin's session is attached.
 *   - SECRET key (used only when saving a new enquiry): bypasses the database
 *     rules entirely, so it never goes near anything a visitor controls.
 */
export type SupabaseAuthConfig = { url: string; publishableKey: string };

export function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url: url.replace(/\/+$/, ""), publishableKey };
}

export const isAdminConfigured = (): boolean => getSupabaseAuthConfig() !== null;

/**
 * Tightens the session cookies the Supabase library writes.
 *
 * The library's defaults leave cookies readable by browser JavaScript, because
 * many apps also run a Supabase client in the browser. This site does all auth
 * on the server, so the cookies are marked HttpOnly: a script injected into a
 * page could not read the session token.
 */
export function hardenCookie<T extends object>(options: T) {
  return {
    ...options,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
