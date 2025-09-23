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
    const hasOtherCarrier = cartItems.some(item => item.carrier !== "amm")
    return hasOtherCarrier ? 35.95 : 5.95
  }

  export function checkShippingType(cartItems: NormalizedCartItem[]): boolean {
    if (cartItems.length === 0) return false
    const hasOtherCarrier = cartItems.some(item => item.carrier !== "amm")
    return hasOtherCarrier
  }