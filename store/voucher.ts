import { atomWithStorage } from "jotai/utils";

export const voucherIdAtom = atomWithStorage<string | null>("voucher_id", null);
