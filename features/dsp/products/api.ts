import { apiDSP } from "@/lib/axios"
import { ProductInput } from "@/lib/schema/product"
import { ProductItem, ProductResponse } from "@/types/products"

interface GetAllProductsParams {
    page?: number
    page_size?: number
    all_products?: boolean
    search?: string
  }
  
  interface SEOInput {
    title: string
    description: string
  }
  
  interface SEOResponse {
    url_key: string
    meta_title: string
    meta_description: string
    meta_keywords: string
  }

export async function getAllProductsDSP(params?: GetAllProductsParams) {
  const { data } = await apiDSP.get('/products/supplier', {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
      ...(params?.all_products !== undefined && { all_products: params.all_products }),
      ...(params?.search !== undefined && { search: params.search }),
    },
  })

  return data as ProductResponse
}

export async function CreateProductDSP(input: ProductInput) {
  const { data } = await apiDSP.post(
    "/products/supplier",
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