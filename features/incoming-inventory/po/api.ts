import { apiAdmin } from "@/lib/axios";
import { IncomingInventoryValues } from "@/lib/schema/incoming-inventory";
import { PurchaseOrderDetail } from "@/types/po";

export async function createPurchaseOrder(input: IncomingInventoryValues) {
  const { data } = await apiAdmin.post("/po/purchase-order", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updatePurchaseOrder(
  purchaseOrderId: string,
  input: IncomingInventoryValues,
) {
  const { data } = await apiAdmin.put(
    `/po/purchase-order/${purchaseOrderId}`,
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

export async function deletePurchaseOrder(purchaseOrderId: string) {
  const { data } = await apiAdmin.delete(
    `/po/purchase-order/${purchaseOrderId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}

export async function getAllPurchaseOrders() {
  const { data } = await apiAdmin.get<PurchaseOrderDetail[]>(
    "/po/purchase-order/all",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data as PurchaseOrderDetail[];
}

export async function getPurchaseOrderDetail(
  purchaseOrderId: string,
): Promise<PurchaseOrderDetail> {
  const { data } = await apiAdmin.get(
    `/po/purchase-order/details/${purchaseOrderId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}
