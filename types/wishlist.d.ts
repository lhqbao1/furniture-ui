import { NewProductItem } from "./products"

export type WishListItem = {
  id: string
  wishlist_id: string
  is_active: boolean
  products: NewProductItem
  image_url: string
  item_price: number
  final_price: number
  price_whithout_tax: number
  quantity: number
  created_at: string
  updated_at: string
}

export interface WishListResponse {
    user_id: string
    id: string
    items: WishListItem[]
    created_at: string
    updated_at: string
}

export interface WishListInput {
    product_id: string
    quantity: number
    is_active: boolean
}
