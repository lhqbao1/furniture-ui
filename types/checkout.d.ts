import { Address } from "./address"
import { CartResponse } from "./cart"
import { Pagination } from "./pagination"
import { Customer, User } from "./user"

interface CheckOutResponse {
    items: CheckOut[]
    pagination: Pagination
}

interface CheckOut {
    id: string
    user: Customer
    checkout_code: string
    shipping_address: Address
    invoice_address: Address
    cart: CartResponse
    status: string  
    note: string
    coupon_amount: number
    voucher_amount: number
    total_amount_item: number
    total_vat: number
    payment_method: string
    total_shipping: number
    from_marketplace: string
    marketplace_order_id: string
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