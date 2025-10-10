import { CartItemLocal } from "@/lib/utils/cart"
import { CartItem } from "@/types/cart"

type NormalizedCartItem = {
    carrier: string
  }
  
 export function normalizeCartItems(
    cartItems: CartItemLocal[] | CartItem[],
    isLoggedIn: boolean
  ): NormalizedCartItem[] {
    if (isLoggedIn) {
      return (cartItems as CartItem[]).map(item => ({
        carrier: item.products.carrier,
      }))
    }
    return (cartItems as CartItemLocal[]).map(item => ({
      carrier: item.carrier,
    }))
  }

  export function calculateShipping(cartItems: NormalizedCartItem[]): number {
    if (cartItems.length === 0) return 0
  
    // ✅ Kiểm tra nếu có ít nhất 1 item có carrier là "amm"
    const hasAmmCarrier = cartItems.some(item => item.carrier === "amm")
  
    // ✅ Nếu có AMM thì 5.95, ngược lại 35.95
    return hasAmmCarrier ? 35.95 : 5.95
  }
  
  export function checkShippingType(cartItems: NormalizedCartItem[]): boolean {
    if (cartItems.length === 0) return false
  
    // ✅ Trả về true nếu có carrier là "amm"
    const hasAmmCarrier = cartItems.some(item => item.carrier === "amm")
  
    return hasAmmCarrier
  }
  