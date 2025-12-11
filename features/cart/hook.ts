import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  clearCartUser,
  deleteCartItem,
  getCartById,
  getCartItems,
  quickAddToCart,
  updateCartItemQuantity,
  updateCartItemStatus,
} from "./api";
import { CartItemLocal, getCart, saveCart } from "@/lib/utils/cart";
import { toast } from "sonner";
import { CartResponseItem } from "@/types/cart";

export function useGetCartItems() {
  return useQuery({
    queryKey: ["cart-items"],
    queryFn: () => getCart(),
    retry: false,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => addToCart(productId, quantity),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },
  });
}

export function useQuickAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => quickAddToCart(productId, quantity),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },
  });
}

export function useGetCartById(cart_id: string) {
  return useQuery({
    queryKey: ["cart-by-id"],
    queryFn: () => getCartById(cart_id),
    retry: false,
    enabled: !!cart_id,
  });
}

export function useDeleteCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => deleteCartItem(cartItemId),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => updateCartItemQuantity(cartItemId, quantity),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },
  });
}

export function useUpdateCartItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cartItemId,
      is_active,
    }: {
      cartItemId: string;
      is_active: boolean;
    }) => updateCartItemStatus(cartItemId, is_active),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },
  });
}

export function useSyncLocalCart(isCheckOut = false, user_id?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const localCart: CartItemLocal[] = getCart();
      if (localCart.length === 0) return;

      // 1️⃣ Thêm tất cả item từ local cart lên server
      const localProductIds = localCart.map((item) => item.product_id);

      for (const item of localCart) {
        await addToCart(item.product_id, item.quantity);
      }

      // 2️⃣ Nếu là checkout => xóa item cũ trên server
      if (isCheckOut) {
        clearCartUser(user_id ?? "");

        const serverCart: CartResponseItem[] = await getCartItems();

        // Server trả về danh sách theo supplier => flatten tất cả items
        const allServerItems = serverCart.flatMap((cart) => cart.items);

        // Xác định item nào cần xóa
        const itemsToRemove = allServerItems.filter(
          (i) => !localProductIds.includes(i.products.id),
        );

        for (const item of itemsToRemove) {
          await deleteCartItem(item.id);
        }
      }

      // 3️⃣ Dọn local cart sau khi sync
      // saveCart([]);
      return true;
    },

    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },

    onError: (err: unknown) => {
      console.error("Error syncing cart:", err);
      toast.error(
        "Die Produktmenge im Warenkorb überschreitet den Lagerbestand",
      );
    },
  });
}

export function useSyncLocalCartCheckOut() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      isCheckOut,
      user_id,
    }: {
      isCheckOut: boolean;
      user_id?: string;
    }) => {
      const localCart: CartItemLocal[] = getCart();
      if (localCart.length === 0) return;
      // 2️⃣ Nếu là checkout => dọn cart server
      if (isCheckOut && user_id) {
        await clearCartUser(user_id);
      }

      // 1️⃣ Thêm toàn bộ item local lên server
      for (const item of localCart) {
        await addToCart(item.product_id, item.quantity);
      }

      return true;
    },

    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["cart-items"] });
    },

    onError: (err: unknown) => {
      console.error("Error syncing cart:", err);
      toast.error(
        "Die Produktmenge im Warenkorb überschreitet den Lagerbestand",
      );
    },
  });
}
