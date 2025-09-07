export type CartItem = {
    id: string
    cart_id: string
    is_active: boolean
    product_id: string
    product_name: string
    variant_name: string
    option_label: string
    option_image_url: string
    option_id: string
    image_url: string
    item_price: number
    final_price: number
    price_whithout_tax: number
    discount_percent: number
    quantity: number
    created_at: string // ISO date string
    updated_at: string // ISO date string
    product_stock: number
    option_stock: number
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
  