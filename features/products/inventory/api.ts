import { apiAdmin } from "@/lib/axios";
import { InventoryCreateValues } from "@/lib/schema/inventory";

export interface UpdateStockInput {
  product_id: string;
  quantity: number;
  user_id: string;
}

export async function createInventory(item: InventoryCreateValues) {
  const { data } = await apiAdmin.post(`/products/inventory`, item, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateInventory(
  inventoryId: string,
  payload: InventoryCreateValues,
) {
  const { data } = await apiAdmin.put(
    `/products/data/inventory/${inventoryId}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}

export async function deleteInventory(inventoryId: string) {
  const { data } = await apiAdmin.delete(`/products/inventory/${inventoryId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateStockProduct(payload: UpdateStockInput) {
  const { data } = await apiAdmin.post(`/products/update-stock`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}
