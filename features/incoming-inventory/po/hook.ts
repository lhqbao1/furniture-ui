import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderDetail,
  UpdatePONumberOfContainerInput,
  updateProductStockFromInventoryPo,
  updatePurchaseOrder,
  updatePurchaseOrderNumberOfContainer,
} from "./api";
import { IncomingInventoryValues } from "@/lib/schema/incoming-inventory";
import { PurchaseOrderDetail } from "@/types/po";
import { inventoryPoKeys } from "../inventory/inventory-po.keys";

type UpdatePurchaseOrderInput = {
  purchaseOrderId: string;
  data: IncomingInventoryValues;
};

type UpdatePONumberOfContainersInput = {
  purchaseOrderId: string;
  input: UpdatePONumberOfContainerInput;
};

type UpdateProductStockFromInventoryPoInput = {
  inventoryPoId: string;
  stock: number;
};

export const PURCHASE_ORDER_QUERY_KEY = ["purchase-orders"];

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IncomingInventoryValues) => createPurchaseOrder(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEY,
      });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrderId, data }: UpdatePurchaseOrderInput) =>
      updatePurchaseOrder(purchaseOrderId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: ["purchase-order-detail", variables.purchaseOrderId],
      });
    },
  });
}

export function useUpdatePONumberOfContainers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrderId, input }: UpdatePONumberOfContainersInput) =>
      updatePurchaseOrderNumberOfContainer(purchaseOrderId, input),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: ["purchase-order-detail", variables.purchaseOrderId],
      });
    },
  });
}

export function useUpdateProductStockFromInventoryPo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryPoId, stock }: UpdateProductStockFromInventoryPoInput) =>
      updateProductStockFromInventoryPo(inventoryPoId, stock),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: inventoryPoKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: inventoryPoKeys.detail(variables.inventoryPoId),
      });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseOrderId: string) =>
      deletePurchaseOrder(purchaseOrderId),

    onSuccess: (_, purchaseOrderId) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEY,
      });

      queryClient.removeQueries({
        queryKey: ["purchase-order-detail", purchaseOrderId],
      });
    },
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
