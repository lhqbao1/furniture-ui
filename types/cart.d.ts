import { ProductItem } from "./products"

export type CartItem = {
  id: string
  cart_id: string
  is_active: boolean
  products: ProductItem
  image_url: string
  item_price: number
  final_price: number
  price_whithout_tax: number
  quantity: number
  created_at: string
  updated_at: string
}
  
  export type CartResponse = {
    user_id: string
    id: string
    items: CartItem[]
    created_at: string
    updated_at: string
  }
  
  export type CartFormValue = {
    product_id: string
    option_id: string
    quantity: number
    is_active: boolean
  }
  