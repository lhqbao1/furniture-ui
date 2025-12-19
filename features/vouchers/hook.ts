"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AssignVoucherToProduct,
  AssignVoucherToUser,
  CreateShippingVoucher,
  createVoucher,
  createVoucherProduct,
  createVoucherShipping,
  createVoucherUser,
  deleteVoucher,
  GetAllVouchersParams,
  getVoucherByCode,
  getVoucherById,
  getVoucherForCheckout,
  GetVoucherForCheckoutInput,
  getVoucherProducts,
  getVouchers,
  getVoucherShipping,
  getVoucherUsers,
  removeProductAssignVoucher,
  removeUserAssignVoucher,
  sendVoucherViaEmail,
  updateVoucher,
  useVoucherApi,
  VoucherUsageInput,
} from "./api";
import { VoucherFormValues, VoucherUpdateValues } from "@/lib/schema/voucher";

/* ---------------------------------------------------------
 * 1. VOUCHER CRUD
 * --------------------------------------------------------- */

export function useGetVouchers(params?: GetAllVouchersParams) {
  return useQuery({
    queryKey: ["vouchers", params],
    queryFn: () => getVouchers(params),
  });
}

export function useGetVoucherById(voucher_id: string) {
  return useQuery({
    queryKey: ["voucher", voucher_id],
    queryFn: () => getVoucherById(voucher_id),
    enabled: !!voucher_id,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VoucherFormValues) => createVoucher(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      voucher_id,
      input,
    }: {
      voucher_id: string;
      input: VoucherUpdateValues;
    }) => updateVoucher(voucher_id, input),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["voucher", variables.voucher_id],
      });
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

export function useRemoveProductAssignVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignVoucherToProduct) =>
      removeProductAssignVoucher(input),

    onSuccess: (_, variables) => {
      // invalidate voucher detail nếu có voucher_id
      if ("voucher_id" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["voucher", variables.voucher_id],
        });
      }

      // invalidate list vouchers
      queryClient.invalidateQueries({
        queryKey: ["vouchers"],
      });
    },
  });
}

export function useRemoveUserAssignVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignVoucherToUser) => removeUserAssignVoucher(input),

    onSuccess: (_, variables) => {
      if ("voucher_id" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["voucher", variables.voucher_id],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["vouchers"],
      });
    },
  });
}

export function useDeleteVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

/* ---------------------------------------------------------
 * 2. VOUCHER → PRODUCT
 * --------------------------------------------------------- */

export function useAssignVoucherToProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignVoucherToProduct) => createVoucherProduct(input),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["voucher-products", variables.voucher_id],
      });
    },
  });
}

export function useGetVoucherProducts(voucher_id: string) {
  return useQuery({
    queryKey: ["voucher-products", voucher_id],
    queryFn: () => getVoucherProducts(voucher_id),
    enabled: !!voucher_id,
  });
}

/* ---------------------------------------------------------
 * 3. VOUCHER → USER
 * --------------------------------------------------------- */

export function useAssignVoucherToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignVoucherToUser) => createVoucherUser(input),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["voucher-users", variables.voucher_id],
      });
    },
  });
}

export function useGetVoucherUsers(voucher_id: string) {
  return useQuery({
    queryKey: ["voucher-users", voucher_id],
    queryFn: () => getVoucherUsers(voucher_id),
    enabled: !!voucher_id,
  });
}

/* ---------------------------------------------------------
 * 4. VOUCHER → SHIPPING
 * --------------------------------------------------------- */

export function useCreateVoucherShipping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShippingVoucher) => createVoucherShipping(input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-shipping"] });
    },
  });
}

export function useGetVoucherShipping() {
  return useQuery({
    queryKey: ["voucher-shipping"],
    queryFn: () => getVoucherShipping(),
  });
}

/* ---------------------------------------------------------
 * 5. APPLY VOUCHER TO ORDER
 * --------------------------------------------------------- */

export function useUseVoucher() {
  return useMutation({
    mutationFn: (input: VoucherUsageInput) => useVoucherApi(input),
  });
}

export function useGetVoucherForCheckout(
  input: GetVoucherForCheckoutInput,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["vouchers", "checkout", input],
    queryFn: () => getVoucherForCheckout(input),
    enabled: enabled && input.product_ids.length > 0 && input.order_value > 0,
  });
}

export function useSendVoucherViaEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => sendVoucherViaEmail(email),
    onSuccess: (res) => {
      // qc.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

export function useGetVoucherByCode(code: string) {
  return useQuery({
    queryKey: ["voucher-by-code", code],
    queryFn: () => getVoucherByCode(code),
    enabled: !!code,
    retry: false,
  });
}
