import { CartItemLocal } from "@/lib/utils/cart";
import { CartItem } from "@/types/cart";
import { ProductItem } from "@/types/products";

type NormalizedCartItem = {
  carrier: string;
};

export function normalizeCartItems(
  cartItems: CartItemLocal[] | CartItem[],
  isLoggedIn: boolean,
): NormalizedCartItem[] {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return [];

  if (isLoggedIn) {
    return (cartItems as CartItem[]).map((item) => ({
      carrier: item?.products?.carrier ?? "none",
    }));
  }

  return (cartItems as CartItemLocal[]).map((item) => ({
    carrier: item?.carrier ?? "none",
  }));
}

export function calculateShipping(cartItems: NormalizedCartItem[]): number {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

  const hasAmmCarrier = cartItems.some((item) => item?.carrier === "amm");

  return hasAmmCarrier ? 35.95 : 5.95;
}

export function calculateShippingCost(items: CartItem[]) {
  const hasAmm = items.some((item) => item.products?.carrier === "amm");

  const gross = hasAmm ? 35.95 : 5.95;
  const vatRate = 0.19;

  const net = Number((gross / (1 + vatRate)).toFixed(2));
  const vat = Number((gross - net).toFixed(2));

  return { gross, net, vat, vatRate };
}

export function checkShippingType(cartItems: NormalizedCartItem[]): boolean {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return false;

  return cartItems.some((item) => item?.carrier === "amm");
}
