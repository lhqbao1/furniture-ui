import { apiAdmin } from "@/lib/axios";
import { WareHouseDetail } from "@/types/po";

export interface POWarehouseInput {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  email: string;
  phone_number: string;
}

export async function createWarehouse(input: POWarehouseInput) {
  const { data } = await apiAdmin.post("/po/create-warehouse", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateWarehouse(
  warehouseId: string,
  input: POWarehouseInput,
) {
  const { data } = await apiAdmin.put(`/po/warehouse/${warehouseId}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function deleteWarehouse(warehouseId: string) {
  const { data } = await apiAdmin.delete(`/po/warehouse/${warehouseId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getWarehouseDetail(
  warehouseId: string,
): Promise<WareHouseDetail> {
  const { data } = await apiAdmin.get(`/po/warehouse/details/${warehouseId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getAllWarehouses(): Promise<WareHouseDetail[]> {
  const { data } = await apiAdmin.get("/po/warehouse/all", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}
