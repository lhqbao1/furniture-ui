import { Address } from "./address"
import { CartResponse } from "./cart"

interface InvoiceResponse {
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
    cart: CartResponse
    shipping_address: Address
    invoice_address: Address
    created_at: string
    updated_at: string
}