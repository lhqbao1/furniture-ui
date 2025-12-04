import { apiAdmin, apiPublic } from "@/lib/axios";
import { VoucherFormValues, VoucherUpdateValues } from "@/lib/schema/voucher";
import { ProductItem } from "@/types/products";
import { Customer } from "@/types/user";
import {
  VoucherCategoryItem,
  VoucherCategoryResponse,
  VoucherItem,
  VoucherProductItem,
  VoucherProductResponse,
  VoucherResponse,
  VoucherShippingItem,
} from "@/types/voucher";

export interface GetAllVouchersParams {
  skip?: number;
  limit?: number;
}

export interface AssignVoucherToProduct {
  voucher_id: string;
  product_ids: string[];
}

export interface AssignVoucherToUser {
  voucher_id: string;
  user_ids: string[];
}

export interface AssignVoucherToCategory {
  voucher_id: string;
  category_id: string;
}

export interface CreateShippingVoucher {
  voucher_id: string;
  max_shipping_discount: number;
  shipping_method: string;
}

export interface VoucherUsageInput {
  voucher_id: string;
  user_id: string;
  order_id: string;
}

export async function createVoucher(input: VoucherFormValues) {
  const { data } = await apiAdmin.post(`/vouchers/`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VoucherItem;
}

export async function getVouchers(params?: GetAllVouchersParams) {
  const { data } = await apiPublic.get("/vouchers/", {
    params: {
      ...(params?.skip !== undefined && { skip: params.skip }),
      ...(params?.limit !== undefined && { limit: params.limit }),
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as VoucherResponse;
}

export async function getVoucherById(voucher_id: string) {
  const { data } = await apiPublic.get(`/vouchers/${voucher_id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as VoucherItem;
}

export async function updateVoucher(
  voucher_id: string,
  input: VoucherUpdateValues,
) {
  const { data } = await apiAdmin.put(`/vouchers/${voucher_id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VoucherItem;
}

export async function createVoucherProduct(input: AssignVoucherToProduct) {
  const { data } = await apiAdmin.post(`/vouchers/products`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getVoucherProducts(voucher_id: string) {
  const { data } = await apiPublic.get(`/vouchers/products/${voucher_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as ProductItem[];
}

export async function createVoucherUser(input: AssignVoucherToUser) {
  const { data } = await apiAdmin.post(`/vouchers/user`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getVoucherUsers(voucher_id: string) {
  const { data } = await apiPublic.get(`/vouchers/user/${voucher_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as Customer[];
}

export async function createVoucherShipping(input: CreateShippingVoucher) {
  const { data } = await apiAdmin.post(`/vouchers/shipping`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VoucherShippingItem;
}

export async function getVoucherShipping() {
  const { data } = await apiPublic.get(`/vouchers/shipping`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VoucherShippingItem[];
}

export async function useVoucherApi(input: VoucherUsageInput) {
  const { data } = await apiPublic.post(`/vouchers/usage`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VoucherShippingItem;
}
