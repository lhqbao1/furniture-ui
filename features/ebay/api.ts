import { apiAdmin, apiPublic } from "@/lib/axios"

export interface EbayProduct {
    title: string
    ean?: string[]
    description: string
    imageUrls: string[]
}

export interface syncToEbayInput {
    sku:string
    product: EbayProduct
    stock: number
    price: number
    tax?: string | null
    carrier?: string
}
export async function syncToEbay(input: syncToEbayInput) {
  const { data } = await apiAdmin.post(
    "/ebay/publish",
    input,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return data
}

export async function removeFromEbay(sku: string){
    const {data} = await apiAdmin.delete(
        `/ebay/product/${sku}`
    )
    return data
}