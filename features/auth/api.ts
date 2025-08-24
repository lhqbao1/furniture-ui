// features/auth/api.ts
import api from "@/lib/axios"
import { LoginResponse, User } from "@/types/user";
import qs from 'qs'
export type LoginInput = { username: string; password: string }

export async function login(input: LoginInput) {
    const { data } = await api.post(
      "/login",
      qs.stringify(input),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      }
    )
    return data as LoginResponse
  }

export async function getMe() {
  const { data } = await api.get("/auth/me")
  return data as { user: User }
}

export async function logout() {
  await api.post("/logout")
}
