import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderDetail,
  updatePurchaseOrder,
} from "./api";
import { IncomingInventoryValues } from "@/lib/schema/incoming-inventory";
import { PurchaseOrderDetail } from "@/types/po";

type UpdatePurchaseOrderInput = {
  purchaseOrderId: string;
  data: IncomingInventoryValues;
};

export const PURCHASE_ORDER_QUERY_KEY = ["purchase-orders"];

export function useCreatePurchaseOrder() {
  return useMutation({
    mutationFn: (input: IncomingInventoryValues) => createPurchaseOrder(input),
  });
}

export function useUpdatePurchaseOrder() {
  return useMutation({
    mutationFn: ({ purchaseOrderId, data }: UpdatePurchaseOrderInput) =>
      updatePurchaseOrder(purchaseOrderId, data),
  });
}

export function useDeletePurchaseOrder() {
  return useMutation({
    mutationFn: (purchaseOrderId: string) =>
      deletePurchaseOrder(purchaseOrderId),
  });
}

export function useGetAllPurchaseOrders() {
  return useQuery<PurchaseOrderDetail[]>({
    queryKey: PURCHASE_ORDER_QUERY_KEY,
    queryFn: getAllPurchaseOrders,

    // optional nhưng nên có
    staleTime: 60 * 1000, // 1 phút
    refetchOnWindowFocus: true,
  });
}

export const useGetPurchaseOrderDetail = (purchaseOrderId?: string) => {
  return useQuery<PurchaseOrderDetail>({
    queryKey: ["purchase-order-detail", purchaseOrderId],
    queryFn: () => getPurchaseOrderDetail(purchaseOrderId!),
    enabled: !!purchaseOrderId, // 👈 rất quan trọng
  });
};
