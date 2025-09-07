// server/api.ts
import { cookies } from "next/headers"

export async function serverGetAllProducts() {
  const cookieStore = cookies()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    credentials: "include",
    cache: "no-store", // tránh bị cache
  })

  if (!res.ok) throw new Error("Failed to fetch products")

  return res.json()
}
