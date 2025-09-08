import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  addToWishList,
  getWishlist,
  removeWishlistItem,
  updateWishlistItemQuantity,
  updateWishlistItemStatus,
  updateCartItemStatus,
  addItemToCart,
  addWishlistToCart,
} from "@/features/wishlist/api"

// === Query ===
export function useGetWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist(),
    retry: false,
  })
}

// === Mutations ===
export function useAddToWishList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToWishList(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

export function useRemoveWishlistItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string }) => removeWishlistItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

export function useUpdateWishlistItemQuantity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateWishlistItemQuantity(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

export function useUpdateWishlistItemStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, is_active }: { itemId: string; is_active: boolean }) =>
      updateWishlistItemStatus(itemId, is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}


export function useAddWishlistItemToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string }) => addItemToCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] })
      queryClient.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}

export function useAddWishlistToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ wishlistId }: { wishlistId: string }) => addWishlistToCart(wishlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] })
      queryClient.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}
