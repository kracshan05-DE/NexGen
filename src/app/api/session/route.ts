import { NextResponse } from "next/server";
import { getSessionState } from "@/lib/admin/session";
import { SIGNED_OUT } from "@/lib/session-hint";
import { isAdminConfigured } from "@/lib/supabase/config";

/**
 * Tells the public header whether the visitor is signed in and whether they
 * are an admin. It answers only about the caller's own session.
 *
 * This decides which buttons the header shows, nothing more. Hiding a button
 * is not security: the dashboard verifies the session itself on every request.
 */
export async function GET() {
  const state = isAdminConfigured() ? await getSessionState() : SIGNED_OUT;
  return NextResponse.json(state, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
