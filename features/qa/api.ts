import { api, apiAdmin, apiPublic } from "@/lib/axios"
import { QAFormValues } from "@/lib/schema/qa"
import { ReviewFormValues } from "@/lib/schema/review"
import { QAResponse } from "@/types/qa"
import { ReviewResponse } from "@/types/review"

export async function createQA(input: QAFormValues) {
  const { data } = await api.post(
    "/forum/",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return data
  }

  export const getQAByProduct = async (product_id: string) => {
      const {data} = await api.get(
          `/forum/forum-product/${product_id}`
      )
          return data as QAResponse[]
  }

  export const getQAByCustomer = async (customer_id: string) => {
    const {data} = await api.get(
        `/forum/forum-customer/${customer_id}`
    )
        return data as QAResponse[]
}

  export async function deleteQA(forum_id: string){
    const {data} = await apiAdmin.delete(
      `/forum/${forum_id}`
    )
    return data
  }