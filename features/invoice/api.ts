import { api, apiFlexible } from "@/lib/axios";
import { InvoiceResponse } from "@/types/invoice";

export async function getInvoiceByCheckOut(checkout_id: string) {
  const { data } = await apiFlexible.get(`/invoice/by_checkout/${checkout_id}`);
  return data as InvoiceResponse;
}

export async function getInvoiceByUserId(user_id: string) {
  const { data } = await apiFlexible.get(`/invoice/by-user/${user_id}`);
  return data as InvoiceResponse[];
}
