import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, deleteCartItem, getCartById, getCartItems, quickAddToCart, updateCartItemQuantity, updateCartItemStatus } from "./api";
import {  CartItemLocal, getCart, saveCart } from "@/lib/utils/cart";
import { toast } from "sonner";


export function useGetCartItems() {
  return useQuery({
    queryKey: ["cart-items"],
    queryFn: async () => {
      const data = await getCartItems()
      // Sort theo created_at giảm dần (mới nhất lên trước)
      data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      return data
    },
    retry: false,
  })
}

export function useAddToCart(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({productId, quantity}: {productId: string, quantity: number}) => addToCart(productId, quantity),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useQuickAddToCart(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({productId, quantity}: {productId: string, quantity: number}) => quickAddToCart(productId, quantity),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useGetCartById(cart_id: string){
    return useQuery({
        queryKey: ["cart-by-id"],
        queryFn: () => getCartById(cart_id),
        retry: false,
        enabled: !!cart_id,
     })
}

export function useDeleteCartItem(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (cartItemId: string) => deleteCartItem(cartItemId),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useUpdateCartItemQuantity(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({cartItemId, quantity}: {cartItemId: string,quantity: number}) => updateCartItemQuantity(cartItemId, quantity),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useUpdateCartItemStatus(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({cartItemId, is_active}: {cartItemId: string,is_active: boolean}) => updateCartItemStatus(cartItemId, is_active),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useSyncLocalCart() {
    const qc = useQueryClient();
  
    return useMutation({
      mutationFn: async () => {
        const localCart: CartItemLocal[] = getCart();
        if (!localCart.length) return;
  
        for (const item of localCart) {
          const res =  await addToCart(item.product_id, item.quantity);
        }
  
        saveCart([]); // clear local cart sau khi sync
        return true;
      },
      onSuccess: () => {
        qc.refetchQueries({ queryKey: ["cart-items"] });
      },
      onError: (err) => {
        console.error("Error syncing cart:", err);
        toast.error("Die Produktmenge im Warenkorb überschreitet den Lagerbestand");
      },
    });
  }