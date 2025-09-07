import api from "@/lib/axios"
import { InvoiceResponse } from "@/types/invoice"

export async function getInvoiceByCheckOut(checkout_id: string) {
    const {data} = await api.get(
        `/invoice/by_checkout/${checkout_id}`,
    )
    return data as InvoiceResponse 
  }
  