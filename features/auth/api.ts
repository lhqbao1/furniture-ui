// features/auth/api.ts
import { api, apiPublic } from "@/lib/axios";
import { LoginResponse, User } from "@/types/user";
import qs from 'qs'
export type LoginInput = { username: string; code: string }
export type SignUpInput = { email: string; phone_number: string, first_name: string, last_name: string, gender?: string }

export async function login(input: LoginInput) {
    const { data } = await apiPublic.post(
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

  export async function loginCookie(input: LoginInput) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(input).toString(),
    })
  
    if (!res.ok) throw new Error("Login failed")
    return res.json()
  }

export async function getMe() {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No token")
  const { data } = await api.get("/me")
  return data as User
}

// export async function getMe() {
//   const { data } = await api.get("/me") // BE đọc token từ cookie
//   return data as User
// }

export async function logout() {
  await api.post("/logout")
}

export async function signUp(input: SignUpInput) {
  const { data } = await apiPublic.post(
    "/signup",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  )
  return data as { access_token: string, token_type: string,id: string,  email: string }
}

export async function signUpGuess(input: SignUpInput) {
  const { data } = await apiPublic.post(
    "/signup-guess",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return data as { access_token: string, token_type: string,id: string,  email: string }
}

export async function forgotPassword(email: string) {
  const { data } = await apiPublic.post(
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

export async function checkMailExist(email: string) {
  const { data } = await apiPublic.post("/check-email", `"${email}"`, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  return data as boolean
}

export async function loginOtp(email: string, code: string) {
  const { data } = await apiPublic.post(
    "/check-otp",
    { email, code },
  )
  return data as { access_token: string, token_type: string,id: string,  email: string }
}

export async function sendOtp(email: string) {
  const { data } = await apiPublic.post(
    "/login-symlink",
    { email },
  )
  return data
}

export async function loginAdmin(username: string) {
  const { data } = await apiPublic.post(
    "/login-admin",
    qs.stringify({ username }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
}

export async function sendOtpDSP(email: string) {
  const { data } = await apiPublic.post(
    "/supplier/login",
    { email },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return data;
}

export async function loginOtpDSP(email: string, code: string) {
  const body = new URLSearchParams()
  body.append('email', email)
  body.append('code', code)

  const { data } = await apiPublic.post(
    '/supplier/check-otp',
    body,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  return data as { access_token: string, token_type: string,id: string,  email: string }
}

export async function resetPassword(email: string, code: string, new_password: string) {
  const { data } = await apiPublic.post(
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
