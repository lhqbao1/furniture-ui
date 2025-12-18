import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const currentVoucherAtom = atomWithStorage<string | null>(
  "voucher_id",
  null,
);

export const lastVoucherAtom = atom<string | null>(null);
