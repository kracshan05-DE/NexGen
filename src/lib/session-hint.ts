/**
 * A marker cookie that says only "someone may be signed in on this browser".
 *
 * Why it exists: the public pages are static files, so they cannot know who
 * is looking at them. The header checks for this cookie in the browser and
 * asks the server for the real session only when it is present. Visitors who
 * have never signed in (nearly everyone) cause no extra request at all.
 *
 * It holds no token and grants nothing. Deleting or forging it changes only
 * whether the header asks the question; the answer still comes from the
 * server, and the dashboard checks the real session again.
 */
export const SESSION_HINT_COOKIE = "nx_signed_in";

export type SessionState = { signedIn: boolean; isAdmin: boolean };

export const SIGNED_OUT: SessionState = { signedIn: false, isAdmin: false };
