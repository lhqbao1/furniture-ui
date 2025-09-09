import { api } from "@/lib/axios"
import { CreateOrderFormValues } from "@/lib/schema/checkout"
import { CheckOut, CheckOutStatistics } from "@/types/checkout"

export async function createCheckOut(item: CreateOrderFormValues) {
    const {data} = await api.post(
        `/checkout`,
        item,
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data as CheckOut
  }

  export async function getCheckOut() {
    const {data} = await api.get(
        '/checkout/',
    )
    return data as CheckOut[]
}

export async function getCheckOutByCheckOutId(checkout_id: string) {
  const {data} = await api.get(
      `/checkout/details/${checkout_id}`,
  )
  return data as CheckOut 
}

export async function getCheckOutByUserId(user_id: string) {
  const {data} = await api.get(
      `/checkout/user/${user_id}`,
  )
  return data as CheckOut[]
}

export async function getCheckOutStatistics() {
  const {data} = await api.get(
      '/checkout/statistics',
  )
  return data as CheckOutStatistics
}