import { apiAdmin, apiPublic } from "@/lib/axios";
import { VoucherFormValues, VoucherUpdateValues } from "@/lib/schema/voucher";
import { ProductItem } from "@/types/products";
import {
  VoucherCategoryItem,
  VoucherCategoryResponse,
  VoucherItem,
  VoucherProductItem,
  VoucherProductResponse,
  VoucherResponse,
} from "@/types/voucher";

export interface GetAllVouchersParams {
  skip?: number;
  limit?: number;
}

export interface AssignVoucherToProduct {
  voucher_id: string;
  product_ids: string[];
}

export interface AssignVoucherToCategory {
  voucher_id: string;
  category_id: string;
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
