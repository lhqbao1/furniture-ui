import { CartItemLocal } from "@/lib/utils/cart";
import { CartItem } from "@/types/cart";

type NormalizedCartItem = {
  productId: string;
  carrier: string;
  isActive: boolean;
};

const FREE_SHIPPING_ONLY_PRODUCT_ID = "3c774b42-1778-4ac5-9c56-3ae6eaf8b19f";

function getActiveCartItems(cartItems: NormalizedCartItem[]) {
  return cartItems.filter((item) => item.isActive !== false);
}

function isOnlyFreeShippingProductCart(cartItems: NormalizedCartItem[]) {
  const activeItems = getActiveCartItems(cartItems);

  if (activeItems.length === 0) return false;

  return activeItems.every(
    (item) => item.productId === FREE_SHIPPING_ONLY_PRODUCT_ID,
  );
}

export function normalizeCartItems(
  cartItems: CartItemLocal[] | CartItem[],
  isLoggedIn: boolean,
): NormalizedCartItem[] {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return [];

  if (isLoggedIn) {
    return (cartItems as CartItem[]).map((item) => ({
      productId: item?.products?.id ?? "",
      carrier: item?.products?.carrier ?? "none",
      isActive: item?.is_active !== false,
    }));
  }

  return (cartItems as CartItemLocal[]).map((item) => ({
    productId: item?.product_id ?? "",
    carrier: item?.carrier ?? "none",
    isActive: item?.is_active !== false,
  }));
}

export function calculateShipping(cartItems: NormalizedCartItem[]): number {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

  if (isOnlyFreeShippingProductCart(cartItems)) return 0;

  const activeItems = getActiveCartItems(cartItems);
  if (activeItems.length === 0) return 0;

  const hasAmmCarrier = activeItems.some(
    (item) =>
      item?.carrier.toLowerCase() === "amm" ||
      item?.carrier.toLowerCase() === "spedition",
  );

  return hasAmmCarrier ? 35.95 : 5.95;
}

export function calculateShippingCost(items: CartItem[]) {
  const activeItems = items.filter((item) => item?.is_active !== false);

  if (activeItems.length === 0) {
    return { gross: 0, net: 0, vat: 0, vatRate: 0.19 };
  }

  if (
    activeItems.length > 0 &&
    activeItems.every(
      (item) => item?.products?.id === FREE_SHIPPING_ONLY_PRODUCT_ID,
    )
  ) {
    return { gross: 0, net: 0, vat: 0, vatRate: 0.19 };
  }

  const hasAmm = activeItems.some(
    (item) =>
      item.products?.carrier === "amm" ||
      item.products?.carrier === "spedition",
  );

  const gross = hasAmm ? 35.95 : 5.95;
  const vatRate = 0.19;

  const net = Number((gross / (1 + vatRate)).toFixed(2));
  const vat = Number((gross - net).toFixed(2));

  return { gross, net, vat, vatRate };
}

export function checkShippingType(cartItems: NormalizedCartItem[]): boolean {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return false;

  return getActiveCartItems(cartItems).some(
    (item) =>
      item?.carrier.toLowerCase() === "amm" ||
      item?.carrier.toLowerCase() === "spedition",
  );
}
