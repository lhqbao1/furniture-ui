import api from "@/lib/axios"
import { Products } from "@/lib/schema/product"
import { ProductItem } from "@/types/products"

export async function CreateProduct(input: Products) {
  const { data } = await api.post(
    "/products/",
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      withCredentials: true,
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

export async function getProductById(id: string) {
  const {data} = await api.get(
      `/products/${id}`,
  )
  return data
}

export async function deleteProduct(id: string){
  const {data} = await api.delete(
    `/products/${id}`
  )
  return data
}

export async function editProduct(input: ProductItem, id: string) {
  const { data } = await api.put(
    `/products/${id}`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      withCredentials: true, // nếu backend cần cookie/session
    }
  )
  return data as ProductItem
  }