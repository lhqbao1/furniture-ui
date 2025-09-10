import { api } from "@/lib/axios"
import { ProductResponse } from "@/types/products"

export async function getViewedProduct(){
    const {data} = await api.get(
        "/viewed/",
        {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      withCredentials: true, // nếu backend cần cookie/session
        }
    )
    return data as ProductResponse
}

export async function addToViewed(product_id: string) {
  const { data } = await api.post(
    `/viewed/`,
    {product_id},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data
}