import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/*
 * The one place that answers "who is this, and may they see enquiries?".
 * Every admin page, action and route handler goes through here, so the check
 * cannot be forgotten on a new page.
 */

/** The signed-in user, verified with Supabase. Cached for the current request. */
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null } as const;

  // getUser() asks Supabase to verify the token. Never trust the cookie alone.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user } as const;
});

/** Whether the signed-in user has role = 'admin' in public.users. Cached for the current request. */
const checkIsAdmin = cache(async (): Promise<boolean> => {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return false;
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("[admin] is_admin check failed:", error.message);
    return false;
  }
  return data === true;
});

/** What the public header needs to know. Never throws and never redirects. */
export async function getSessionState(): Promise<{ signedIn: boolean; isAdmin: boolean }> {
  const { user } = await getSessionUser();
  if (!user) return { signedIn: false, isAdmin: false };
  return { signedIn: true, isAdmin: await checkIsAdmin() };
}

/**
 * For everything that touches enquiries.
 * Signed out: go to the sign-in page. Signed in without the admin role: go
 * back to the website. A normal account has nothing to see here, so it is
 * simply not let in.
 */
export async function requireAdmin() {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) redirect("/admin/login");
  if (!(await checkIsAdmin())) redirect("/");
  return { supabase, user };
}
