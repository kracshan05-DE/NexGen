import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAuthConfig, hardenCookie } from "./config";

/**
 * A Supabase client that acts as the signed-in person.
 *
 * The session lives in HttpOnly cookies, so it is never readable by
 * JavaScript in the browser. Every query made through this client carries the
 * person's own access token, which means the database's row level security
 * decides what comes back. Create one per request; never share it.
 *
 * Returns null when Supabase has not been configured yet.
 */
export async function createClient() {
  const config = getSupabaseAuthConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, hardenCookie(options));
          }
        } catch {
          // Cookies cannot be written while a page is rendering, only in
          // Server Actions and Route Handlers. That is fine: the proxy
          // (src/proxy.ts) refreshes the session before any page renders.
        }
      },
    },
  });
}
