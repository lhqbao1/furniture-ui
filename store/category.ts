import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const selectedCategoryAtom = atom<string>('')
export const selectedCategoryNameAtom = atom<string>('')
export const currentCategoryIdAtom = atomWithStorage<string | null>("currentCategory", null)
export const currentCategoryNameAtom = atomWithStorage<string | null>("currentCategoryName", null)
