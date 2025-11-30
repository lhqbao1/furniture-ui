// features/auth/state.ts
import { atomWithStorage } from "jotai/utils";

export const userIdAtom = atomWithStorage<string | null>("user_id", null);
export const adminIdAtom = atomWithStorage<string | null>(
  "admin_user_id",
  null,
);

export const accessTokenAtom = atomWithStorage<string | null>(
  "access_token",
  null,
);
