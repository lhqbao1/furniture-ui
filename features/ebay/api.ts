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
    min_stock?: number
    max_stock?: number
    brand: string
}
export async function syncToEbay(input: syncToEbayInput) {
  const { data, status } = await apiAdmin.post("/ebay/publish", input, {
    headers: { "Content-Type": "application/json" },
  });

  if (status >= 400) {
    // Throw một lỗi để React Query gọi onError
    throw new Error(data?.message || "Failed to sync to eBay");
  }

  return data;
}

export async function removeFromEbay(sku: string){
    const {data} = await apiAdmin.delete(
        `/ebay/product/${sku}`
    )
    return data
}