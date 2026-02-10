import { apiAdmin, apiPublic } from "@/lib/axios";

interface KauflandBrandInput {
  name: string | null;
  email: string | null;
  address: string | null;
  phone: string | null;
}

export interface syncToKauflandInput {
  ean: string;
  title: string;
  description: string;
  image_urls: string[];
  price: number;
  stock: number;
  carrier: string;
  sku: string;
  marketplace_offer_id?: string;
  product_id: string;
  min_stock?: number;
  max_stock?: number;
  brand: KauflandBrandInput;
  handling_time?: number;
}
export async function syncToKaufland(input: syncToKauflandInput) {
  const response = await apiAdmin.post("/kaufland/products/publish", input, {
    headers: { "Content-Type": "application/json" },
    validateStatus: undefined, // keep default behavior
  });

  if (response.status >= 400) {
    const detailMessage =
      response.data?.detail?.errors?.[0]?.message ||
      response.data?.detail ||
      response.data?.message ||
      response.data?.error ||
      "Failed to sync to Kaufland";

    const error = new Error(detailMessage) as Error & {
      response?: typeof response;
    };
    error.response = response;
    throw error;
  }

  return response.data;
}

export async function removeFromKaufland(offer_id: string) {
  const { data } = await apiAdmin.delete(
    `/kaufland/products/delete/${offer_id}`,
  );
  return data;
}
