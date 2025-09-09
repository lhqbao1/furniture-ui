// features/auth/hooks.ts
"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMe, login, logout, LoginInput, signUp, SignUpInput, forgotPassword, resetPassword, loginAdmin } from "./api"
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
      qc.invalidateQueries({ queryKey: ["me"] })
    },
  })
}

export function useLoginAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => loginAdmin(input),
    onSuccess: (res) => {
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

export function useSignUp() {
  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({email,code,new_password}: {email: string, code: string, new_password: string}) => resetPassword(email, code, new_password),
  })
}