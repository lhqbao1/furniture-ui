import { apiAdmin, apiPublic } from "@/lib/axios";

export interface EbayProduct {
  title: string;
  ean?: string[];
  description: string;
  imageUrls: string[];
}

export interface EbayManufacturer {
  name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
}

export interface EbayDocument {
  title: string;
  url: string;
}

export interface syncToEbayInput {
  sku: string;
  product: EbayProduct;
  stock: number;
  price: number;
  tax?: string | null;
  carrier?: string;
  min_stock?: number;
  max_stock?: number;
  brand: string;
  manufacturer: EbayManufacturer;
  documents?: EbayDocument[] | null;
  ebay_offer_id: string | null;
}

export async function syncToEbay(input: syncToEbayInput) {
  const response = await apiAdmin.post("/ebay/publish", input, {
    headers: { "Content-Type": "application/json" },
    validateStatus: undefined,
  });

  if (response.status >= 400) {
    const detailMessage =
      response.data?.detail?.errors?.[0]?.message ||
      response.data?.detail ||
      response.data?.message ||
      response.data?.error ||
      "Failed to sync to eBay";

    const error = new Error(detailMessage) as Error & {
      response?: typeof response;
    };
    error.response = response;
    throw error;
  }

  return response.data;
}

export async function removeFromEbay(sku: string) {
  const { data } = await apiAdmin.delete(`/ebay/product/${sku}`);
  return data;
}
