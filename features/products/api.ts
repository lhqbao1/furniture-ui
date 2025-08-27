import api from "@/lib/axios"
import { Products } from "@/lib/schema/product"

export async function CreateProduct(input: Products) {
  const { data } = await api.post(
    "/products/",
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      withCredentials: true, // nếu backend cần cookie/session
    }
  )
  return data as Products
  }

  export async function getAllProducts() {
    const {data} = await api.get(
        '/products/',
    )
    return data
}