import api from "@/lib/axios"
import { ProductGroupDetailResponse, ProductGroupResponse } from "@/types/product-group"
import { NewProductItem, ProductItem } from "@/types/products"

export async function createProductGroup(name: string) {
  const { data } = await api.post(
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
    const {data} = await api.get(
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
    const {data} = await api.get(
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
    return data as NewProductItem[]
}

export async function getProductGroupDetail(parent_id: string){
    const {data} = await api.get(
        `/parent/details/${parent_id}`,
        {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
      withCredentials: true, // nếu backend cần cookie/session
        }
    )
    return data as ProductGroupDetailResponse
}

export async function updateProductGroup(name: string, id: string) {
  const { data } = await api.put(
    `/parent/${id}`,
    name,
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

export async function deleteProductGroup(id: string){
  const {data} = await api.delete(
    `/parent/${id}`
  )
  return data
}