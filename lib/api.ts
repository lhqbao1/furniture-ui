import axios from "axios"

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`, // backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
})

export async function getCheckOutByCheckOutId(checkoutId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout/${checkoutId}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch checkout")
  return res.json()
}

export async function getInvoiceByCheckOutId(checkoutId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/by_checkout/${checkoutId}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch invoice")
  return res.json()
}
