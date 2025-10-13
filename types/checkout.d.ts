import { Address } from "./address"
import { CartItem, CartResponse, CartResponseItem } from "./cart"
import { Pagination } from "./pagination"
import { SupplierResponse } from "./supplier"
import { Customer, User } from "./user"

interface CheckOutResponse {
    items: CheckOut[]
    pagination: Pagination
}

interface CartResponseCheckOut {
    user_id: string
    supplier_id: string
    id: string
    created_at: string
    updated_at: string
    items: CartItem[]
}
interface CheckOut {
    id: string
    user: Customer
    checkout_code: string
    shipping_address: Address
    invoice_address: Address
    cart: CartResponseItem
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
    supplier: SupplierResponse
    created_at: Date
    updated_at: Date
}

export interface CheckOutMain {
    id: string
    checkout_code: string
    status: string
    note: string
    total_amount_item: number
    total_shipping: number
    total_vat: number
    total_amount: number
    coupon_amount: number
    voucher_amount: number
    from_marketplace: string
    marketplace_order_id: string
    payment_method: string
    checkouts: CheckOut[]
    created_at: Date
    updated_at: Date
  }
  interface CheckOutMainResponse {
    items: CheckOutMain[]
    pagination: Pagination
}

interface CheckOutStatistics {
    order_processing: number
    processing_transaction: number
    cancel_transaction: number
    completed_transaction: number
}