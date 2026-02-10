import { apiAdmin, apiPublic } from "@/lib/axios";

export type SyncToAmazonInput = {
  sku: string;
  title: string;
  manufacturer: string;
  description: string;
  price: number;
  ean: string;
  weight: number;
  part_number: string;
  is_fragile: boolean;
  number_of_items: number;
  included_components: string;
  height: number;
  width: number;
  length: number;
  depth: number;
  package_length: number;
  package_width: number;
  package_height: number;
  color: string;
  unit_count: number;
  unit_count_type: string;
  asin: string | null;
  stock: number;
  carrier: string;
  images: string[];
  brand: string;
  model_number: string;
  browse_node?: string;
  size: string;
  country_of_origin: string;
  min_stock: number;
  max_stock: number;
  handling_time?: number;
  bullet_point1: string;
  bullet_point2: string;
  bullet_point3: string;
  bullet_point4: string;
  bullet_point5: string;
};

export async function syncToAmazon(input: SyncToAmazonInput) {
  const response = await apiAdmin.post("/amz/publish", input, {
    headers: { "Content-Type": "application/json" },
    validateStatus: undefined,
  });

  if (response.status >= 400) {
    const detailMessage =
      response.data?.detail?.errors?.[0]?.message ||
      response.data?.detail ||
      response.data?.message ||
      response.data?.error ||
      "Failed to sync to Amazon";

    const error = new Error(detailMessage) as Error & {
      response?: typeof response;
    };
    error.response = response;
    throw error;
  }

  return response.data;
}

export async function removeFromAmazon(sku: string) {
  const { data } = await apiAdmin.delete(`/amz/listing/item/${sku}`);
  return data;
}
