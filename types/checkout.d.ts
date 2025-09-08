import { Address } from "./address"
import { CartResponse } from "./cart"
import { User } from "./user"

interface CheckOut {
    id: string
    user: User
    shipping_address: Address
    invoice_address: Address
    cart: CartResponse
    status: string  
    note: string
    coupon_amount: number
    voucher_amount: number
    total_amount_item: number
    total_vat: number
    total_shipping: number
    total_amount: number

    created_at: Date
    updated_at: Date
}

interface CheckOutStatistics {
    order_processing: number
    processing_transaction: number
    cancel_transaction: number
    completed_transaction: number
}