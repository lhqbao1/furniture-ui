import { CreateOrderFormValues } from "@/lib/schema/checkout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCheckOut, createManualCheckOut, GetAllCheckoutParams, getCheckOut, getCheckOutByCheckOutId, getCheckOutByUserId, getCheckOutMain, getCheckOutMainByUserIdAdmin, getCheckOutStatistics, getCheckOutSupplier, getCheckOutSupplierByCheckOutId, getMainCheckOutByMainCheckOutId } from "./api";
import { ManualCreateOrderFormValues } from "@/lib/schema/manual-checkout";

export function useGetCheckOut({ page, page_size }: GetAllCheckoutParams = {}){
    return useQuery({
       queryKey: ["checkout", page, page_size],
       queryFn: () => getCheckOut({ page, page_size }),
       retry: false,
     })
}

export function useGetCheckOutSupplier({ page, page_size }: GetAllCheckoutParams = {}){
  return useQuery({
     queryKey: ["supplier-checkout", page, page_size],
     queryFn: () => getCheckOutSupplier({ page, page_size }),
     retry: false,
   })
}

export function useGetCheckOutMain({ page, page_size }: GetAllCheckoutParams = {}){
  return useQuery({
     queryKey: ["checkout-main", page, page_size],
     queryFn: () => getCheckOutMain({ page, page_size }),
     retry: false,
   })
}

export function useCreateCheckOut(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (item: CreateOrderFormValues) => createCheckOut(item),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["checkout"] })
            qc.refetchQueries({ queryKey: ["checkout-statistic"] })
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useCreateCheckOutManual(){
  const qc = useQueryClient();
  return useMutation({
      mutationFn: (item: ManualCreateOrderFormValues) => createManualCheckOut(item),
      onSuccess: () => {
          qc.refetchQueries({ queryKey: ["checkout"] })
          qc.refetchQueries({ queryKey: ["checkout-statistic"] })
      },
  })
}

export function useGetCheckOutByCheckOutId(checkout_id: string) {
  return useQuery({
    queryKey: ["checkout-id", checkout_id],
    queryFn: () => getCheckOutByCheckOutId(checkout_id),
    enabled: !!checkout_id,
    retry: false,
  })
}

export function useGetSupplierCheckOutByCheckOutId(checkout_id: string) {
  return useQuery({
    queryKey: ["supplier-checkout-id", checkout_id],
    queryFn: () => getCheckOutSupplierByCheckOutId(checkout_id),
    enabled: !!checkout_id,
    retry: false,
  })
}

export function useGetMainCheckOutByMainCheckOutId(main_checkout_id: string) {
  return useQuery({
    queryKey: ["checkout-id", main_checkout_id],
    queryFn: () => getMainCheckOutByMainCheckOutId(main_checkout_id),
    enabled: !!main_checkout_id,
    retry: false,
  })
}

export function useGetCheckOutByUserId(user_id: string) {
  return useQuery({
    queryKey: ["checkout-user-id", user_id],
    queryFn: () => getCheckOutByUserId(user_id),
    enabled: !!user_id,
    retry: false,
  })
}

export function useGetCheckOutMainByUserIdAdmin(user_id: string) {
  return useQuery({
    queryKey: ["checkout-user-id", user_id],
    queryFn: () => getCheckOutMainByUserIdAdmin(user_id),
    enabled: !!user_id,
    retry: false,
  })
}

export function useGetCheckOutStatistic(){
  return useQuery({
     queryKey: ["checkout-statistic"],
     queryFn: () => getCheckOutStatistics(),
     retry: false,
   })
}