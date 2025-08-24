// features/auth/state.ts
import { atomWithStorage } from "jotai/utils"

export const userIdAtom = atomWithStorage<string | null>("id", null)
export const accessTokenAtom = atomWithStorage<string | null>("access_token", null)
