import { apiAdmin } from "@/lib/axios";
import { CustomerDetail } from "@/types/po";

export type CustomerCreateInput = {
  name: string;
  tax_id?: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
};

export async function createCustomer(input: CustomerCreateInput) {
  const { data } = await apiAdmin.post("/po/customer", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateCustomer(
  customerId: string,
  input: CustomerCreateInput,
) {
  const { data } = await apiAdmin.put(`/po/customer/${customerId}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function deleteCustomer(customerId: string) {
  const { data } = await apiAdmin.delete(`/po/customer/${customerId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getCustomerDetail(customerId: string) {
  const { data } = await apiAdmin.get(`/po/customer/details/${customerId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as CustomerDetail;
}

export async function getAllCustomers() {
  const { data } = await apiAdmin.get("/po/customer/all", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as CustomerDetail[];
}
