export const config = {
  regions: ['fra1'],
};

import { apiAdmin, apiPublic } from "@/lib/axios"
import { ProductGroupDetailResponse, ProductGroupResponse } from "@/types/product-group"
import { ProductItem } from "@/types/products"

export async function createProductGroup(name: string) {
  const { data } = await apiAdmin.post(
    "/parent/",
    {name},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data as ProductGroupResponse
  }

export async function getProductGroup(){
    const {data} = await apiPublic.get(
        "/parent/",
        {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
      withCredentials: true, // nếu backend cần cookie/session
        }
    )
    return data as ProductGroupResponse[]
}

export async function getAllProductsSelect(params?: string){
    const {data} = await apiPublic.get(
        `/products/all/`,
        {
        params: params ? { search: params } : {}, // backend xử lý param search
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
      withCredentials: true, // nếu backend cần cookie/session
        }
    )
    return data as ProductItem[]
}

export async function getProductGroupDetail(parent_id: string){
    const {data} = await apiPublic.get(
        `/parent/details/${parent_id}`,
    )
    return data as ProductGroupDetailResponse
}

export async function updateProductGroup(name: string, id: string) {
  const { data } = await apiAdmin.put(
    `/parent/${id}`,
    {name},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true, // nếu backend cần cookie/session
    }
  )
  return data as ProductGroupResponse
  }

export async function deleteProductGroup(parent_id: string){
  const {data} = await apiAdmin.delete(
    `/parent/${parent_id}`
  )
  return data
}