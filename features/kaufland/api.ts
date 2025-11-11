import { apiAdmin, apiPublic } from "@/lib/axios"

interface KauflandBrandInput {
  name: string | null
  email: string | null
  address: string | null
}

export interface syncToKauflandInput {
    ean:string
    title: string
    description: string
    image_urls: string[]
    price: number
    stock: number
    carrier: string
    sku: string
    marketplace_offer_id?: string
    product_id: string
    min_stock?: number
    max_stock?: number
    brand: KauflandBrandInput
}
export async function syncToKaufland(input: syncToKauflandInput) {
  const response = await apiAdmin.post("/kaufland/products/publish", input, {
    headers: { "Content-Type": "application/json" },
    validateStatus: undefined, // optional: dùng mặc định Axios
  });

  // Kiểm tra status manual
  if (response.status >= 400) {
    throw new Error(response.data?.message || "Failed to sync to Kaufland");
  }

  return response.data;
}


export async function removeFromKaufland(offer_id: string){
    const {data} = await apiAdmin.delete(
        `/kaufland/products/delete/${offer_id}`
    )
    return data
}