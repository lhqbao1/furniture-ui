// utils/cart.ts

import { InventoryPosItem } from "@/types/products";

export type CartItemLocal = {
  id?: string;
  product_id: string;
  quantity: number;
  is_active: boolean;
  item_price: number;
  final_price: number;
  img_url: string;
  product_name: string;
  stock: number;
  carrier: string;
  id_provider?: string;
  delivery_time?: string;
  brand_name?: string;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  inventory: InventoryPosItem[];
  url_key: string;
  result_stock: number;
};

const CART_KEY = "guest_cart";

export function getCart(): CartItemLocal[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCart(items: CartItemLocal[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToLocalCart(item: CartItemLocal) {
  const cart = getCart();
  const existing = cart.find((i) => i.product_id === item.product_id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function removeFromLocalCart(product_id: string) {
  let cart = getCart();

  // lọc ra những sản phẩm khác product_id
  cart = cart.filter((item) => item.product_id !== product_id);

  saveCart(cart);
  return cart;
}

export function updateLocalCartQuantity(
  product_id: string,
  newQuantity: number,
) {
  let cart = getCart();

  cart = cart.map((item) => {
    if (item.product_id === product_id) {
      return { ...item, quantity: newQuantity };
    }
    return item;
  });

  // Remove items with quantity <= 0
  cart = cart.filter((item) => item.quantity > 0);

  saveCart(cart);
  return cart;
}

export function updateLocalCartStatus(product_id: string, is_active: boolean) {
  const cart = getCart().map((item) =>
    item.product_id === product_id ? { ...item, is_active } : item,
  );

  saveCart(cart);
  return cart;
}
