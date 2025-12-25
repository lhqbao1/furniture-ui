import { apiAdmin } from "@/lib/axios";
import { SupplierInput, SupplierResponse } from "@/types/supplier";

export interface SendTrackingInput {
  tracking_number: string;
  shipping_carrier: string;
  shipped_date: string; // ISO string
}

export const getSupplier = async () => {
  const { data } = await apiAdmin.get("/supplier");
  return data as SupplierResponse[];
};

export async function createSupplier(input: SupplierInput) {
  const { data } = await apiAdmin.post("/supplier", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });
  return data as SupplierResponse;
}

export async function deleteSupplier(supplier_id: string) {
  const { data } = await apiAdmin.delete(`/supplier/${supplier_id}`);
  return data;
}

export async function editSupplier(input: SupplierInput, supplier_id: string) {
  const { data } = await apiAdmin.put(`/supplier/${supplier_id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data;
}

export async function sendSupplierTracking(
  checkout_id: string,
  input: SendTrackingInput,
) {
  const { data } = await apiAdmin.post(
    `/supplier/send-tracking/${checkout_id}`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("dsp_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}
