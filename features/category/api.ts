import api from "@/lib/axios"
import { AddOrRemoveProductToCategoryInput, CategoryByIdResponse, CategoryInput, CategoryResponse } from "@/types/categories"

export async function getCategories(){
    const {data} = await api.get(
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
    const {data} = await api.get(
        `/categories/${id}`,
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


export async function createCategory(input: CategoryInput) {
  const { data } = await api.post(
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
  const { data } = await api.post(
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
  const { data } = await api.post(
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
  const { data } = await api.put(
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
  const {data} = await api.delete(
    `/categories/${id}`
  )
  return data
}