// features/auth/state.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const userIdAtom = atomWithStorage<string | null>("user_id", null);

export const authHydratedAtom = atom(false);

export const userIdGuestAtom = atomWithStorage<string | null>(
  "userIdGuest",
  null,
);

export const adminIdAtom = atomWithStorage<string | null>(
  "admin_user_id",
  null,
);

export const supplierIdAtom = atomWithStorage<string | null>(
  "supplier_id",
  null,
);

export const accessTokenAtom = atomWithStorage<string | null>(
  "access_token",
  null,
);
