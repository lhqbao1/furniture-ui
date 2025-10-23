import { atom } from "jotai"

export const searchProductQueryStringAtom = atom<string>('')
export const showAllProductsAtom = atom<boolean>(true) // 🔥 thêm dòng này
