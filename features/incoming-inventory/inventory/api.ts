import { apiAdmin, apiPublic } from "@/lib/axios";
import { ListInventoryPO, POContainerInventoryDetail } from "@/types/po";

export interface InventoryPoCreateInput {
  container_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  description?: string;
  list_delivery_date?: string;
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

export async function getContainerInventory(
  containerId: string,
): Promise<POContainerInventoryDetail[]> {
  const { data } = await apiAdmin.get(
    `/po/container/inventory/${containerId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}

export async function getInventoryPoDetail(
  inventoryPoId: string,
): Promise<POContainerInventoryDetail> {
  const { data } = await apiAdmin.get(
    `/po/inventory-po/details/${inventoryPoId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}

export async function getInventoryPoByProductId(
  productId: string,
): Promise<POContainerInventoryDetail[]> {
  const { data } = await apiPublic.get(
    `/po/inventory-po/by-product/${productId}`,
  );

  return data;
}

export async function deleteInventoryPo(inventoryPoId: string) {
  const { data } = await apiAdmin.delete(`/po/inventory-po/${inventoryPoId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getAllInventoryPo(
  search?: string,
): Promise<ListInventoryPO> {
  const { data } = await apiAdmin.get("/po/inventory-po/all", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
    params: search ? { search } : undefined,
  });

  return data;
}
