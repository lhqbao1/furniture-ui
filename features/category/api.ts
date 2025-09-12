import { api, apiAdmin, apiPublic } from "@/lib/axios"
import { AddOrRemoveProductToCategoryInput, CategoryByIdResponse, CategoryInput, CategoryResponse } from "@/types/categories"
import { NewProductItem } from "@/types/products"

export async function getCategories(){
    const {data} = await apiPublic.get(
        "/categories/",
        {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
      withCredentials: true, // nếu backend cần cookie/session
        }
    )
    return data as CategoryResponse[]
}


export async function getCategoryById(id: string){
    const {data} = await apiPublic.get(
        `/categories/details/${id}`,
        {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
      withCredentials: true, // nếu backend cần cookie/session
        }
    )
    return data as CategoryByIdResponse
}

export async function getCategoryByName(params?: string){
  const {data} = await apiPublic.get(
      `/categories/by-name`,
      {
        params: params ? { category_name: String(params) } : {},
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
    withCredentials: true, // nếu backend cần cookie/session
      }
  )
  return data as NewProductItem[]
}


export async function createCategory(input: CategoryInput) {
  const { data } = await apiAdmin.post(
    "/categories/",
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data as CategoryResponse
  }

  export async function addProductToCategory(input: AddOrRemoveProductToCategoryInput, category_id: string) {
  const { data } = await apiAdmin.post(
    `/categories/add-product/${category_id}`,
    input,
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

    export async function removeProductFromCategory(input: AddOrRemoveProductToCategoryInput, category_id: string) {
  const { data } = await apiAdmin.post(
    `/categories/remove-product/${category_id}`,
    input,
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

  export async function editCategory(input: CategoryInput, id: string) {
  const { data } = await apiAdmin.put(
    `/categories/${id}`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true, // nếu backend cần cookie/session
    }
  )
  return data
  }

  export async function deleteCategory(id: string){
  const {data} = await apiAdmin.delete(
    `/categories/${id}`
  )
  return data
}