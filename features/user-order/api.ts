import { apiAdmin } from "@/lib/axios";
import { UserOrderFormValues } from "@/lib/schema/user-order";

export interface InformationManualOrderResponse {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  company?: string;
  tax_id?: string;
  phone_number?: string;
  address?: string;
  additional_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  recipient_name?: string;
  recipient_email?: string;
  recipient_phone_number?: string;
  recipient_address?: string;
  recipient_additional_address?: string;
  recipient_city?: string;
  recipient_postal_code?: string;
  recipient_country?: string;
  same_as_invoice?: boolean;
  id?: string | number;
  created_at?: string;
  updated_at?: string;
  message?: string;
  [key: string]: unknown;
}

export type InformationManualOrderListResponse =
  | InformationManualOrderResponse[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: InformationManualOrderResponse[];
    };

export async function createInformationManualOrder(
  payload: UserOrderFormValues,
) {
  const { data } = await apiAdmin.post(
    "/information_manual_order/",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return data as InformationManualOrderResponse;
}

export async function getInformationManualOrders(search?: string) {
  const { data } = await apiAdmin.get("/information_manual_order/", {
    params: {
      ...(search?.trim() ? { search: search.trim() } : {}),
    },
  });

  return data as InformationManualOrderListResponse;
}

export async function getInformationManualOrderDetail(
  information_manual_order_id: string,
) {
  const { data } = await apiAdmin.get(
    `/information_manual_order/detail/${information_manual_order_id}`,
  );

  return data as InformationManualOrderResponse;
}

export async function deleteInformationManualOrder(
  information_manual_order_id: string,
) {
  const { data } = await apiAdmin.delete(
    `/information_manual_order/${information_manual_order_id}`,
  );

  return data as InformationManualOrderResponse;
}
