import qs from "qs";
import { apiAdmin } from "@/lib/axios";
import { IncomingInventoryValues } from "@/lib/schema/incoming-inventory";
import { PurchaseOrderDetail } from "@/types/po";

export interface UpdatePONumberOfContainerInput {
  number_of_containers: number;
}

export interface GetAllPurchaseOrdersParams {
  search?: string | string[];
}

export async function updateProductStockFromInventoryPo(
  inventoryPoId: string,
  stock: number,
) {
  const { data } = await apiAdmin.put(
    `/po/product/updated-stock/${inventoryPoId}`,
    null,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
      params: {
        stock,
      },
    },
  );

  return data;
}

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

export async function updatePurchaseOrderNumberOfContainer(
  purchaseOrderId: string,
  input: UpdatePONumberOfContainerInput,
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

export async function getAllPurchaseOrders(
  params?: GetAllPurchaseOrdersParams,
) {
  const { data } = await apiAdmin.get<PurchaseOrderDetail[]>(
    "/po/purchase-order/all",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
      params: {
        ...(params?.search !== undefined && { search: params.search }),
      },
      paramsSerializer: (queryParams) =>
        qs.stringify(queryParams, { arrayFormat: "repeat" }),
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
