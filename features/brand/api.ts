export const config = {
  regions: ['fra1'],
};

import { apiAdmin, apiPublic } from "@/lib/axios"
import { BrandInput, BrandResponse } from "@/types/brand"

export const getBrand = async () => {
    const {data} = await apiPublic.get(
        '/brand/'
    )
        return data as BrandResponse[]
}

export async function createBrand(input: BrandInput) {
  const { data } = await apiAdmin.post(
    "/brand/",
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    }
  )
  return data as BrandResponse
  }

  export async function deleteBrand(brand_id: string){
    const {data} = await apiAdmin.delete(
      `/brand/${brand_id}`
    )
    return data
  }

    export async function editBrand(input: BrandInput, brand_id: string) {
    const { data } = await apiAdmin.put(
      `/brand/${brand_id}`,
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