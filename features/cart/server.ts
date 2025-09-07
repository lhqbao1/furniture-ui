// features/cart/server.ts
import { cookies } from "next/headers"

export async function getCartItemsServer() {
  // ví dụ: gọi API backend, hoặc đọc từ DB bằng userId trong cookie
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart`, {
    headers: {
      Cookie: cookies().toString(), // để giữ session
    },
    cache: "no-store", // luôn lấy fresh data
  })

  if (!res.ok) throw new Error("Failed to fetch products")

  return res.json()
}
