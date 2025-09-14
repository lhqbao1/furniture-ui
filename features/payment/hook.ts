import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { capturePayment, createPayment, getPaymentStatus } from "./api"

export function useCreatePayment() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (paymentInput: PaymentFormValues) => createPayment(paymentInput),
      onSuccess: (res) => {
        // qc.invalidateQueries({ queryKey: ["products"] })
      },
    })
}

export function useCapturePayment() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (paymentId: string) => capturePayment(paymentId),
      retry: false,
      onSuccess: (res) => {
        // qc.invalidateQueries({ queryKey: ["products"] })
      },
    })
}

export function useGetPaymentStatus(payment_id: string) {
    return useQuery({
      queryKey: ["payment", payment_id],
      queryFn: () => getPaymentStatus(payment_id),
      enabled: !!payment_id,
      retry: false,
    })
  }