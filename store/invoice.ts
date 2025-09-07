import { atomWithStorage } from "jotai/utils";

export const invoiceIdAtom = atomWithStorage<string | null>('invoiceId', null)
