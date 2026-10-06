/** Shapes returned by the admin Server Actions. Safe to import from client components. */
export type AuthState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string }
  | { status: "check-email"; email: string };

export const initialAuthState: AuthState = { status: "idle" };

export type SaveState =
  | { status: "idle" }
  | { status: "saved"; at: number }
  | { status: "error"; message: string };

export const initialSaveState: SaveState = { status: "idle" };

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_NOTES_LENGTH = 5000;
