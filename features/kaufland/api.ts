import { apiAdmin, apiPublic } from "@/lib/axios"

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
}
export async function syncToKaufland(input: syncToKauflandInput) {
  const { data } = await apiAdmin.post(
    "/kaufland/products/publish",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return data
}

export async function removeFromKaufland(offer_id: string){
    const {data} = await apiAdmin.delete(
        `/kaufland/products/delete/${offer_id}`
    )
    return data
}