import api from "@/lib/axios"
import { ProductInput } from "@/lib/schema/product"
import { NewProductItem, Product, ProductItem, ProductResponse } from "@/types/products"

interface GetAllProductsParams {
  page?: number
  page_size?: number
}

export async function CreateProduct(input: ProductInput) {
  const { data } = await api.post(
    "/products/",
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data as NewProductItem
  }
  

export async function getAllProducts(params?: GetAllProductsParams) {
  const { data } = await api.get('/products/', {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
    },
  })

  return data as ProductResponse
}

export async function getProductById(id: string) {
  const {data} = await api.get(
      `/products/${id}`,
  )
  return data as NewProductItem 
}

export async function getProductByTag(tag: string) {
  const {data} = await api.get(
      `/products/by-tag/${tag}`,
  )
  return data as NewProductItem[]
}

export async function deleteProduct(id: string){
  const {data} = await api.delete(
    `/products/${id}`
  )
  return data
}

export async function editProduct(input: ProductInput, id: string) {
  const { data } = await api.put(
    `/products/${id}`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true, // nếu backend cần cookie/session
    }
  )
  return data as NewProductItem
  }