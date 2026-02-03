import { CreateOrderFormValues } from "@/lib/schema/checkout";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cancelExchangeOrder,
  cancelMainCheckout,
  cancelNoStockOrder,
  cancelOrder,
  cancelWrongPrice,
  changeOrderReturnStatus,
  createCheckOut,
  createDeliveryOrder,
  createManualCheckOut,
  DeliveryOrderPayload,
  getAllCheckOutMain,
  GetAllCheckoutParams,
  getCheckOut,
  getCheckOutByCheckOutId,
  getCheckOutByUserId,
  getCheckOutDashboard,
  getCheckOutMain,
  getCheckOutMainByUserIdAdmin,
  getCheckOutStatistics,
  getCheckOutSupplier,
  getCheckOutSupplierByCheckOutId,
  getMainCheckOutByMainCheckOutId,
  getProductsCheckOutDashboard,
  makeOrderPaid,
  OrderStatisticsParams,
  returnOrder,
} from "./api";
import { ManualCreateOrderFormValues } from "@/lib/schema/manual-checkout";
import React from "react";
import { getLast6Months } from "@/lib/get-last-6-months";

export function useGetCheckOut({ page, page_size }: GetAllCheckoutParams = {}) {
  return useQuery({
    queryKey: ["checkout", page, page_size],
    queryFn: () => getCheckOut({ page, page_size }),
    retry: false,
  });
}

export function useGetCheckOutSupplier({
  page,
  page_size,
}: GetAllCheckoutParams = {}) {
  return useQuery({
    queryKey: ["supplier-checkout", page, page_size],
    queryFn: () => getCheckOutSupplier({ page, page_size }),
    retry: false,
  });
}

export function useCreateCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: CreateOrderFormValues) => createCheckOut(item),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },
  });
}

export function useCreateCheckOutManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: ManualCreateOrderFormValues) =>
      createManualCheckOut(item),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
    },
  });
}

export function useGetCheckOutByCheckOutId(checkout_id: string) {
  return useQuery({
    queryKey: ["checkout-id", checkout_id],
    queryFn: () => getCheckOutByCheckOutId(checkout_id),
    enabled: !!checkout_id,
    retry: false,
  });
}

export function useGetSupplierCheckOutByCheckOutId(checkout_id: string) {
  return useQuery({
    queryKey: ["supplier-checkout-id", checkout_id],
    queryFn: () => getCheckOutSupplierByCheckOutId(checkout_id),
    enabled: !!checkout_id,
    retry: false,
  });
}

export function useGetMainCheckOutByMainCheckOutId(main_checkout_id: string) {
  return useQuery({
    queryKey: ["checkout-main-id", main_checkout_id],
    queryFn: () => getMainCheckOutByMainCheckOutId(main_checkout_id),
    enabled: !!main_checkout_id,
    retry: false,
  });
}

export function useGetCheckOutByUserId(user_id: string) {
  return useQuery({
    queryKey: ["checkout-user-id", user_id],
    queryFn: () => getCheckOutByUserId(user_id),
    enabled: !!user_id,
    retry: false,
  });
}

export function useGetCheckOutMainByUserIdAdmin(user_id: string) {
  return useQuery({
    queryKey: ["checkout-user-id", user_id],
    queryFn: () => getCheckOutMainByUserIdAdmin(user_id),
    enabled: !!user_id,
    retry: false,
  });
}

export function useGetCheckOutStatistic(params?: {
  from_date?: string;
  to_date?: string;
}) {
  return useQuery({
    queryKey: [
      "checkout-statistic",
      params?.from_date ?? null,
      params?.to_date ?? null,
    ],
    queryFn: () => getCheckOutStatistics(params),
    placeholderData: (previousData) => previousData,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useGetCheckOutMain(params: GetAllCheckoutParams = {}) {
  const { page, page_size, status, channel, from_date, to_date, search } =
    params;

  return useQuery({
    queryKey: [
      "checkout-main",
      page ?? 1,
      page_size ?? 50,
      (status ?? []).join(","),
      (channel ?? []).join(","),
      from_date ?? null,
      to_date ?? null,
      search ?? null,
    ],
    queryFn: () => getCheckOutMain(params),
    retry: false,
  });
}

export function useGetAllCheckOutMain() {
  return useQuery({
    queryKey: ["checkout-main-all"],
    queryFn: () => getAllCheckOutMain(),
    retry: false,
  });
}

export function useReturnOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (main_checkout_id: string) => returnOrder(main_checkout_id),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({ queryKey: ["checkout-user-id"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables],
      });
    },
  });
}

export function useChangeOrderReturnStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      main_checkout_id,
      status,
    }: {
      main_checkout_id: string;
      status: string;
    }) => changeOrderReturnStatus(main_checkout_id, status),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({ queryKey: ["checkout-user-id"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables],
      });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (main_checkout_id: string) => cancelOrder(main_checkout_id),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({ queryKey: ["checkout-user-id"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables],
      });
    },
  });
}

export function useCancelNoStockOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (main_checkout_id: string) =>
      cancelNoStockOrder(main_checkout_id),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({ queryKey: ["checkout-user-id"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables],
      });
    },
  });
}

export function useCancelWrongPriceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (main_checkout_id: string) =>
      cancelWrongPrice(main_checkout_id),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({ queryKey: ["checkout-user-id"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables],
      });
    },
  });
}

export function useMakeOrderPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (main_checkout_id: string) => makeOrderPaid(main_checkout_id),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables],
      });
    },
  });
}

export function useCancelExchangeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      checkout_id,
      main_checkout_id,
    }: {
      checkout_id: string;
      main_checkout_id: string;
    }) => cancelExchangeOrder(checkout_id),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables.main_checkout_id],
      });
    },
  });
}

export function useCreateDeliveryOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      main_checkout_id,
      payload,
    }: {
      main_checkout_id: string;
      payload: DeliveryOrderPayload;
    }) => createDeliveryOrder(main_checkout_id, payload),

    onSuccess: (data, variables) => {
      // refetch các query liên quan
      qc.refetchQueries({ queryKey: ["checkout-main"] });
      qc.refetchQueries({ queryKey: ["checkout"] });
      qc.refetchQueries({ queryKey: ["checkout-statistic"] });
      qc.refetchQueries({
        queryKey: ["checkout-main-id", variables.main_checkout_id],
      });
    },
  });
}

export const useCancelMainCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMainCheckout,

    onSuccess: () => {
      // 🔁 refresh invoice list của user
      queryClient.invalidateQueries({
        queryKey: ["invoice-by-user-id"],
      });

      // (optional) refresh order list nếu có
      queryClient.invalidateQueries({
        queryKey: ["checkout-user-id"],
      });
    },
  });
};

export const useGetCheckOutDashboard = (params: OrderStatisticsParams) => {
  return useQuery({
    queryKey: ["checkout-dashboard", params.from_date, params.to_date],
    queryFn: () => getCheckOutDashboard(params),
    retry: false,
  });
};

export const useGetProductsCheckOutDashboard = (
  params?: OrderStatisticsParams,
) => {
  return useQuery({
    queryKey: [
      "checkout-dashboard-products",
      params?.from_date,
      params?.to_date,
    ],
    queryFn: () => getProductsCheckOutDashboard(params),
    retry: false,
  });
};

export function useCheckoutDashboardLast6Months() {
  const months = React.useMemo(() => getLast6Months(), []);

  const queries = useQueries({
    queries: months.map((m) => ({
      queryKey: ["checkout-dashboard", m.from_date, m.to_date],
      queryFn: () =>
        getCheckOutDashboard({
          from_date: m.from_date,
          to_date: m.to_date,
        }),
    })),
  });

  return {
    isLoading: queries.some((q) => q.isLoading),
    chartData: months.map((m, index) => ({
      month: m.label,
      total: queries[index]?.data?.grand_total_amount ?? 0,
      total_order: queries[index]?.data?.grand_total_orders ?? 0,
    })),
  };
}
