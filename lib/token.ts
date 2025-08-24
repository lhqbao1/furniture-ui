// lib/token.ts
let _accessToken: string | null = null

export const tokenStore = {
  get: () => _accessToken,
  set: (t: string | null) => {
    _accessToken = t
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("access_token", t)
      else localStorage.removeItem("access_token")
    }
  },
  hydrateFromStorage: () => {
    if (typeof window !== "undefined") {
      _accessToken = localStorage.getItem("access_token")
    }
  },
}
