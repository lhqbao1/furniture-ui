import { api, apiAdmin, apiPublic } from "@/lib/axios"
import { ProductInput } from "@/lib/schema/product"
import { ProductItem, ProductResponse } from "@/types/products"

interface GetAllProductsParams {
  page?: number
  page_size?: number
  all_products?: boolean
}

export async function CreateProduct(input: ProductInput) {
  const { data } = await apiAdmin.post(
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
  return data as ProductItem
  }
  

export async function getAllProducts(params?: GetAllProductsParams) {
  const { data } = await apiPublic.get('/products/', {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
      ...(params?.all_products !== undefined && { all_products: params.all_products }),
    },
  })

  return data as ProductResponse
}

export async function getProductById(id: string) {
  const {data} = await apiPublic.get(
      `/products/${id}`,
  )
  return data as ProductItem 
}

export async function getProductByTag(tag: string) {
  const {data} = await apiPublic.get(
      `/products/by-tag/${tag}`,
  )
  return data as ProductItem[]
}

export async function deleteProduct(id: string){
  const {data} = await apiAdmin.delete(
    `/products/${id}`
  )
  return data
}

export async function editProduct(input: ProductInput, id: string) {
  const { data } = await apiAdmin.put(
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
  return data as ProductItem
  }
