import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAuthConfig, hardenCookie } from "@/lib/supabase/config";

/*
 * Runs before every /admin request (and only /admin, so the public site stays
 * fully static). It has two jobs:
 *
 *   1. Keep the session alive. Access tokens are short-lived; this swaps an
 *      expired one for a fresh one and writes the new cookies back.
 *   2. Bounce signed-out visitors to the sign-in page early.
 *
 * Job 2 is a convenience, not the security boundary. Each admin page and
 * action checks the session again (src/lib/admin/session.ts), and the database
 * enforces admin-only access on its own (supabase/schema.sql).
 */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/signup"]);

export async function proxy(request: NextRequest) {
  const config = getSupabaseAuthConfig();
  // Not configured yet: let the pages render their "not set up" notice.
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, hardenCookie(options));
        }
        // Responses that set session cookies must never be cached.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Validates the session with Supabase and refreshes it if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_ADMIN_PATHS.has(pathname);

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed session cookies.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!user && !isPublicPath) return redirectTo("/admin/login");
  // Already signed in: the sign-in and sign-up pages have nothing to offer.
  if (user && isPublicPath) return redirectTo("/");

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
