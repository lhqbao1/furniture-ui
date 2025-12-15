import qs from "qs";
import { api, apiAdmin, apiDSP, apiFlexible } from "@/lib/axios";
import { CreateOrderFormValues } from "@/lib/schema/checkout";
import { ManualCreateOrderFormValues } from "@/lib/schema/manual-checkout";
import {
  CheckOut,
  CheckOutMain,
  CheckOutMainResponse,
  CheckOutResponse,
  CheckOutStatistics,
} from "@/types/checkout";

export interface GetAllCheckoutParams {
  page?: number;
  page_size?: number;
  status?: string[]; // <-- Mảng
  channel?: string[] | null; // ✔ cho phép null
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface OrderStatisticsParams {
  from_date?: string;
  to_date?: string;
}

export interface DeliveryOrderItem {
  product_id: string;
  quantity: number;
}

export interface DeliveryOrderPayload {
  items: DeliveryOrderItem[];
  carrier: string;
}

export async function createCheckOut(item: CreateOrderFormValues) {
  const { data } = await api.post(`/checkout`, item, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    withCredentials: true,
  });
  return data as CheckOut;
}

export async function createManualCheckOut(item: ManualCreateOrderFormValues) {
  const { data } = await apiAdmin.post(`/checkout/manual-checkout`, item, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data as CheckOut;
}

export async function getCheckOut(params?: GetAllCheckoutParams) {
  const { data } = await apiAdmin.get("/checkout/", {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
    },
  });
  return data as CheckOutResponse;
}

export async function getCheckOutSupplier(params?: GetAllCheckoutParams) {
  const { data } = await apiDSP.get("/checkout/supplier", {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
    },
  });
  return data as CheckOutResponse;
}

export async function getCheckOutMain(params?: GetAllCheckoutParams) {
  const { data } = await apiAdmin.get("/checkout/main-checkouts", {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
      ...(params?.status !== undefined && { status: params.status }), // array
      ...(params?.channel !== undefined && { channel: params.channel }), // array
      ...(params?.from_date !== undefined && { from_date: params.from_date }),
      ...(params?.to_date !== undefined && { to_date: params.to_date }),
      ...(params?.search !== undefined && { search: params.search }),
    },

    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data as CheckOutMainResponse;
}

export async function getCheckOutByCheckOutId(checkout_id: string) {
  const { data } = await apiFlexible.get(`/checkout/details/${checkout_id}`);
  return data as CheckOut;
}

export async function getCheckOutSupplierByCheckOutId(checkout_id: string) {
  const { data } = await apiDSP.get(
    `/checkout/supplier/details/${checkout_id}`,
  );
  return data as CheckOut;
}

export async function getMainCheckOutByMainCheckOutId(
  main_checkout_id: string,
) {
  const { data } = await apiFlexible.get(
    `/checkout/main-checkout/details/${main_checkout_id}`,
  );
  return data as CheckOutMain;
}

export async function getCheckOutByUserId(user_id: string) {
  const { data } = await api.get(`/checkout/user/${user_id}`);
  return data as CheckOut[];
}

export async function getCheckOutMainByUserId(user_id: string) {
  const { data } = await api.get(`/checkout/main-checkout/user/${user_id}`);
  return data as CheckOutMain[];
}

export async function getCheckOutMainByUserIdAdmin(user_id: string) {
  const { data } = await apiAdmin.get(
    `/checkout/main-checkout/user/${user_id}`,
  );
  return data as CheckOutMain[];
}

export async function getCheckOutStatistics(params?: OrderStatisticsParams) {
  const { data } = await apiAdmin.get("/checkout/statistics", {
    params: {
      ...(params?.from_date !== undefined && { from_date: params.from_date }),
      ...(params?.to_date !== undefined && { to_date: params.to_date }),
    },
  });
  return data as CheckOutStatistics;
}

export async function returnOrder(main_checkout_id: string) {
  const { data } = await apiAdmin.put(`/checkout/return/${main_checkout_id}`);
  return data;
}

export async function changeOrderReturnStatus(
  main_checkout_id: string,
  status: string,
) {
  const { data } = await apiAdmin.put(
    `/checkout/change-return-status/${status}`,
    null,
    {
      params: {
        main_checkout_id,
      },
    },
  );

  return data;
}

export async function makeOrderPaid(main_checkout_id: string) {
  const { data } = await apiAdmin.post(
    `/checkout/make-checkout-paid/${main_checkout_id}`,
  );
  return data;
}

export async function cancelOrder(main_checkout_id: string) {
  const { data } = await apiAdmin.put(`/checkout/cancel/${main_checkout_id}`);
  return data;
}

export async function createDeliveryOrder(
  main_checkout_id: string,
  payload: DeliveryOrderPayload,
) {
  const { data } = await apiAdmin.post(
    `/checkout/create-delivery-order/${main_checkout_id}`,
    payload,
  );
  return data;
}

export async function cancelExchangeOrder(checkout_id: string) {
  const { data } = await apiAdmin.post(
    `/checkout/cancel-exchange/${checkout_id}`,
  );
  return data;
}
