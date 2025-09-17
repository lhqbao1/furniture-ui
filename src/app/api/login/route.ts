import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.text() // login form-urlencoded

  // gọi BE
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    credentials: "include",
  })

  const data = await res.json()

  // lấy cookie từ backend (nếu có)
  const setCookie = res.headers.get("set-cookie")

  const response = NextResponse.json(data, { status: res.status })

  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie)
  }

  return response
}
