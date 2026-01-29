import { apiAdmin } from "@/lib/axios";

export interface InventoryPoCreateInput {
  container_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  description?: string;
}

export async function createInventoryPo(input: InventoryPoCreateInput) {
  const { data } = await apiAdmin.post("/po/inventory-po", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateInventoryPo(
  inventoryPoId: string,
  input: InventoryPoCreateInput,
) {
  const { data } = await apiAdmin.put(
    `/po/inventory-po/${inventoryPoId}`,
    input,
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
