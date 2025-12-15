import { atomWithStorage } from "jotai/utils";

export const voucherIdAtom = atomWithStorage<string>("voucher_id", "");
