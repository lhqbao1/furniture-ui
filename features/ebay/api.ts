import { apiPublic } from "@/lib/axios"

interface EbayProduct {
    title: string
    ean: string[]
    description: string
    imageUrls: string[]
}

export interface syncToEbayInput {
    sku:string
    product: EbayProduct
    stock: number
    price: number
    tax: string
}
export async function syncToEbay(input: syncToEbayInput) {
  const { data } = await apiPublic.post(
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
    const {data} = await apiPublic.delete(
        `/ebay/product/${sku}`
    )
    return data
}