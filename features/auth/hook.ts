// features/auth/hooks.ts
"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMe, login, logout, LoginInput, signUp, SignUpInput, forgotPassword, resetPassword, loginAdmin, checkMailExist, loginOtp, loginCookie } from "./api"
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
      qc.refetchQueries({ queryKey: ["me"] })
    },
  })
}

// export function useLogin() {
//   return useMutation({
//     mutationFn: async (input: LoginInput) => {
//       const res = await fetch("/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams(input).toString(),
//       })

//       if (!res.ok) throw new Error("Login failed")
//       return res.json()
//     },
//   })
// }

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
    onSuccess(data, variables, context) {
      localStorage.setItem("userId", data.id)
    },
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

export function useCheckMailExist() {
  return useMutation({
    mutationFn: (email: string) => checkMailExist(email),
  })
}

export function useLoginOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      loginOtp(email, code),
    onSuccess(data) {
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("userId", data.id)
    },
  })
}