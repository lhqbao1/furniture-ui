import { CartItem, CartResponseItem } from "@/types/cart";

export function flattenCartItems(carts: CartResponseItem[]): CartItem[] {
  return carts.flatMap((cart) => cart.items);
}
