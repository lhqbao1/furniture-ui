import { atomWithStorage } from "jotai/utils";

export const adminSidebarLockedAtom = atomWithStorage<boolean>(
  "admin_sidebar_locked",
  false,
);
