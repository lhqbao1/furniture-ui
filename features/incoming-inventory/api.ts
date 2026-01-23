import { apiAdmin } from "@/lib/axios";

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
