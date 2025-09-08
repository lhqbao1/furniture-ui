import { CheckOut } from "@/types/checkout";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const paymentIdAtom = atomWithStorage<string | null>('payment', null)
export const checkOutIdAtom = atomWithStorage<string | null>('checkout', null)
