import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, deleteCartItem, getCartById, getCartItems, quickAddToCart, updateCartItemQuantity, updateCartItemStatus } from "./api";
import { CartFormValue } from "@/types/cart";


export function useGetCartItems(){
    return useQuery({
        queryKey: ["cart-items"],
        queryFn: () => getCartItems(),
        retry: false,
     })
}

export function useAddToCart(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({productId, quantity, option_id}: {productId: string, quantity: number, option_id?: string | null}) => addToCart(productId, quantity, option_id),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["cart-items"] })
        },
    })
}

export function useQuickAddToCart(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({productId, quantity, option_id}: {productId: string, quantity: number, option_id: string}) => quickAddToCart(productId, quantity, option_id),
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