export const config = {
  regions: ['fra1'],
};

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

export async function getProductByIdDSP(product_id: string) {
  const {data} = await apiDSP.get(
      `/products/supplier/detail/${product_id}`,
  )
  return data as ProductItem 
}

export async function CreateProductDSP(input: ProductInput) {
  const { data } = await apiDSP.post(
    "/products/supplier",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return data as ProductItem
  }

  export async function deleteProductDSP(product_id: string){
    const {data} = await apiDSP.delete(
      `/products/supplier/${product_id}`
    )
    return data
  }

  export async function editProductDSP(input: ProductInput, product_id: string) {
    const { data } = await apiDSP.put(
      `/products/supplier/${product_id}`,
      input,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    return data as ProductItem
    }