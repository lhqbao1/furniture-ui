import { CheckOut } from "@/types/checkout";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const paymentIdAtom = atom<string>('')
export const checkOutIdAtom = atomWithStorage<string | null>('checkout', null)
