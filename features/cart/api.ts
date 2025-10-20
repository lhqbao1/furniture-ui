export const config = {
  regions: ['fra1'],
};

import { api } from "@/lib/axios"
import { CartResponse } from "@/types/cart"

export async function getCartItems() {
    const {data} = await api.get(
        `/cart/`,
    )
    return data as CartResponse
  }

export async function addToCart(productId: string, quantity: number) {
    const {data} = await api.post(
        `/cart/add-item`,
        {product_id: productId, quantity, is_active: true},
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data as CartResponse
  }

  export async function quickAddToCart(productId: string, quantity: number) {
    const {data} = await api.post(
        `/cart/add-quick-buy-items`,
        {product_id: productId, quantity},
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data as CartResponse
  }

  export async function getCartById(cart_id: string) {
    const {data} = await api.get(
        `/cart/${cart_id}`,
    )
    return data as CartResponse
  }

  export async function deleteCartItem(cartItemId: string) {
    const {data} = await api.delete(
        `/cart/remove-item/${cartItemId}`,
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data
  }

  export async function updateCartItemQuantity(cartItemId: string,quantity: number) {
    const {data} = await api.patch(
        `/cart/update-item-quantity/${cartItemId}`,
        {quantity},
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data
  }

  export async function updateCartItemStatus(cartItemId: string, is_active: boolean) {
    const {data} = await api.patch(
        `/cart/update-item-active/${cartItemId}`,
        {is_active},
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data
  }