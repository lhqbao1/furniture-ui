// features/auth/hooks.ts
"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMe, login, logout, LoginInput } from "./api"
import { tokenStore } from "@/lib/token"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (res) => {
      tokenStore.set(res.access_token)
      qc.invalidateQueries({ queryKey: ["me"] })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      tokenStore.set(null)
      qc.invalidateQueries({ queryKey: ["me"] })
    },
  })
}
