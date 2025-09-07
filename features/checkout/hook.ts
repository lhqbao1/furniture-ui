import { CreateOrderFormValues } from "@/lib/schema/checkout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCheckOut, getCheckOut, getCheckOutByCheckOutId, getCheckOutByUserId, getCheckOutStatistics } from "./api";

export function useGetCheckOut(){
    return useQuery({
       queryKey: ["products"],
       queryFn: () => getCheckOut(),
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

export function useGetCheckOutByUserId(user_id: string) {
  return useQuery({
    queryKey: ["checkout-user-id", user_id],
    queryFn: () => getCheckOutByUserId(user_id),
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