import { Address } from "./address"
import { CartResponse } from "./cart"
import { CheckOutMain } from "./checkout"

export interface InvoiceResponse {
    checkout_id: string
    coupon_amount: number
    voucher_amount: number
    total_amount_item: number
    total_vat: number
    total_shipping: number
    total_amount: number
    id: string
    invoice_code: string
    user_code: string
    main_checkout: CheckOutMain
    created_at: Date
    updated_at: Date
  }