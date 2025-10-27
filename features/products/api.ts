export const config = {
  regions: ['fra1'],
};

import { api, apiAdmin, apiPublic } from "@/lib/axios"
import { ProductInput } from "@/lib/schema/product"
import { ProductItem, ProductResponse } from "@/types/products"

export interface GetAllProductsParams {
  page?: number
  page_size?: number
  all_products?: boolean
  search?: string
  sort_by_stock?: string
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
      ...(params?.search !== undefined && { search: params.search }),
      ...(params?.sort_by_stock && { sort_by_stock: params.sort_by_stock }),
    },
  })

  return data as ProductResponse
}

export async function getProductsFeed() {
  const {data} = await apiPublic.get(
      `/products/all-product`,
  )
  return data as ProductItem[]
}

export async function getProductById(id: string) {
  const {data} = await apiPublic.get(
      `/products/details/${id}`,
  )
  return data as ProductItem 
}

export async function getProductBySlug(product_slug: string) {
  const {data} = await apiPublic.get(
      `/products/by-slug/${product_slug}`,
  )
  return data as ProductItem
}

export async function getProductByTag(tag: string, is_customer = false) {
  const { data } = await apiPublic.get(`/products/by-tag/${tag}`, {
    params: { is_customer }, // truyền query param ở đây
  })
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


  export async function generateSEO(input: SEOInput) {
    const { data } = await apiAdmin.post(
      "/products/ai-generate-metadata",
      input,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
        withCredentials: true,
      }
    )
    return data as SEOResponse
}