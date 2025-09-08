import api from "@/lib/axios"
import { WishListResponse } from "@/types/wishlist"

export async function addToWishList(productId: string, quantity: number) {
    const {data} = await api.post(
        `/wishlist/add-item`,
        {product_id: productId, quantity},
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data as WishListResponse
}

export async function getWishlist() {
    const {data} = await api.get(
        `/wishlist/`,
    )
    return data as WishListResponse
}

  export async function removeWishlistItem(itemId: string) {
    const {data} = await api.delete(
        `/wishlist/remove-item/${itemId}`,
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

    export async function updateWishlistItemQuantity(itemId: string,quantity: number) {
    const {data} = await api.patch(
        `/wishlist/update-item-quantity/${itemId}`,
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

    export async function updateWishlistItemStatus(itemId: string, is_active: boolean) {
    const {data} = await api.patch(
        `/wishlist/update-item-active/${itemId}`,
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


export async function addItemToCart(itemId: string) {
    const {data} = await api.post(
        `/wishlist/add-item-to-cart/${itemId}`,
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

export async function addWishlistToCart(wishlistId: string) {
    const {data} = await api.post(
        `/wishlist/add-wishlist-to-cart/${wishlistId}`,
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