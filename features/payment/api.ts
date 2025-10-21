export const config = {
  regions: ['fra1'],
};

import { api } from "@/lib/axios"

export async function createPayment(paymentInput: PaymentFormValues) {
    const {data} = await api.post(
        `/payments/`,
        paymentInput,
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data
  }

  export async function capturePayment(paypal_order_id: string) {
    const {data} = await api.post(
        `/payments/${paypal_order_id}/capture`,
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data
  }

  export async function getPaymentStatus(payment_id: string) {
    const {data} = await api.get(
        `/payments/${payment_id}/capture`,
    )
    return data
  }