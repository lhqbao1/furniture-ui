// features/auth/api.ts
import { api } from "@/lib/axios";
import { LoginResponse, User } from "@/types/user";
import qs from 'qs'
export type LoginInput = { username: string; password: string }
export type SignUpInput = { email: string; password: string, phone_number: string, first_name: string, last_name: string }

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

  export async function loginAdmin(input: LoginInput) {
    const { data } = await api.post(
      "/login-admin",
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
  const { data } = await api.get("/me")
  return data as User
}

export async function logout() {
  await api.post("/logout")
}

export async function signUp(input: SignUpInput) {
  const { data } = await api.post(
    "/signup",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  )
  return data as { message: string }

}

export async function forgotPassword(email: string) {
  const { data } = await api.post(
    "/forgot-password",
    { email },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  )
  return data as { message: string }
}

export async function resetPassword(email: string, code: string, new_password: string) {
  const { data } = await api.post(
    "/reset-password",
    { email, code, new_password },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  )
  return data
}