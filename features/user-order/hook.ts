import { useMutation, useQuery } from "@tanstack/react-query";
import { UserOrderFormValues } from "@/lib/schema/user-order";
import {
  createInformationManualOrder,
  deleteInformationManualOrder,
  getInformationManualOrderDetail,
  getInformationManualOrders,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateInformationManualOrder() {
  return useMutation({
    mutationFn: (payload: UserOrderFormValues) =>
      createInformationManualOrder(payload),
  });
}

export function useGetInformationManualOrders(search?: string) {
  return useQuery({
    queryKey: ["information-manual-order", search ?? null],
    queryFn: () => getInformationManualOrders(search),
    retry: false,
  });
}

export function useGetInformationManualOrderDetail(
  information_manual_order_id: string,
) {
  return useQuery({
    queryKey: ["information-manual-order-detail", information_manual_order_id],
    queryFn: () =>
      getInformationManualOrderDetail(information_manual_order_id),
    enabled: !!information_manual_order_id,
    retry: false,
  });
}

export function useDeleteInformationManualOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (information_manual_order_id: string) =>
      deleteInformationManualOrder(information_manual_order_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["information-manual-order"] });
    },
  });
}
