import { api, apiFlexible } from "@/lib/axios";
import { AddOptionToProductInput, VariantOption, VariantOptionInput, VariantOptionsResponse, VariantResponse } from "@/types/variant";

export async function getVariants(){
    const {data} = await apiFlexible.get(
        "/variants/",
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

export async function getVariantById(id: string) {
  const {data} = await apiFlexible.get(
      `/variants/${id}`,
  )
  return data as VariantResponse 
}

export async function getVariantOptionByVariant(name: string) {
  const {data} = await apiFlexible.get(
      `/variants/${name}/options`,
  )
  return data as VariantOption[]
}

export async function createVariant(parent_id: string, name: string) {
  const { data } = await apiFlexible.post(
    `/variants/${parent_id}`,
    {name},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data as VariantResponse
}

export async function deleteVariant(id: string){
  const {data} = await apiFlexible.delete(
    `/variants/${id}`
  )
  return data
}


export async function addOptionToProduct(input: AddOptionToProductInput) {
  const { data } = await api.post(
    `/variants/parent/add-option-to-product`,
    JSON.stringify(input), // stringify tay
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

export async function createVariantOption(variant_id: string, input: VariantOptionInput) {
  const { data } = await api.post(
    `/variants/${variant_id}/options`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data as VariantOptionsResponse
}