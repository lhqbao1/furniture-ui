import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const searchProductQueryStringAtom = atom<string>('')
export const showAllProductsAtom = atom<boolean>(true) // 🔥 thêm dòng này
export const sortByStockAtom = atomWithStorage<"asc" | "desc" | undefined>(
  "sortByStock", // key lưu trong localStorage
  undefined
)