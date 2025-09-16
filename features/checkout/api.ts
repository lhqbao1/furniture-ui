import { api, apiAdmin, apiFlexible } from "@/lib/axios"
import { CreateOrderFormValues } from "@/lib/schema/checkout"
import { CheckOut, CheckOutResponse, CheckOutStatistics } from "@/types/checkout"

export interface GetAllCheckoutParams {
  page?: number
  page_size?: number
}

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

  export async function getCheckOut(params?: GetAllCheckoutParams) {
    const {data} = await apiAdmin.get(
        '/checkout/',
        {
          params: {
            ...(params?.page !== undefined && { page: params.page }),
            ...(params?.page_size !== undefined && { page_size: params.page_size }),
          },
        }
    )
    return data as CheckOutResponse
}

export async function getCheckOutByCheckOutId(checkout_id: string) {
  const {data} = await apiFlexible.get(
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
  const {data} = await apiAdmin.get(
      '/checkout/statistics',
  )
  return data as CheckOutStatistics
}