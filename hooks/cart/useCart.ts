"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCartItems } from "@/features/cart/api";
import { useCartLocal } from "@/hooks/cart";
import { CartItemLocal } from "@/lib/utils/cart";
import { toast } from "sonner";
import { CartItem, CartResponse } from "@/types/cart";
import { useLocale } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "use-intl";

interface CartActionsProps {
  userId: string | null;
  displayedCart: CartResponse | CartItemLocal[];
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCartData() {
  const [userId, setUserId] = React.useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("userId") : "",
  );

  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const { cart: localCart, updateStatus } = useCartLocal();

  const { data: cart, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart-items", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await getCartItems();
      return [...response].sort((a, b) => {
        const latestA = Math.max(
          ...a.items.map((i) => new Date(i.created_at).getTime()),
        );
        const latestB = Math.max(
          ...b.items.map((i) => new Date(i.created_at).getTime()),
        );
        return latestB - latestA;
      });
    },
  });

  const displayedCart = useMemo(
    () => (userId ? cart ?? [] : localCart),
    [userId, cart, localCart],
  );

  const total = useMemo(() => {
    if (userId && cart) {
      return cart
        .flatMap((g) => g.items)
        .filter((i) => i.is_active)
        .reduce((acc, item) => {
          const key = item.id;
          const qty = localQuantities[key] ?? item.quantity;
          return acc + qty * item.item_price;
        }, 0);
    }
    return (
      localCart
        ?.filter((item) => item.is_active)
        .reduce((acc, item) => {
          const key =
            "id" in item ? item.id : (item as CartItemLocal).product_id;
          const quantity = localQuantities[key ?? ""] ?? item.quantity;
          return acc + quantity * item.item_price;
        }, 0) ?? 0
    );
  }, [userId, cart, localCart, localQuantities]);

  return {
    userId,
    setUserId,
    cart,
    localCart,
    displayedCart,
    isLoadingCart,
    localQuantities,
    setLocalQuantities,
    updateStatus,
    total,
  };
}

export function CartActions({
  userId,
  displayedCart,
  setIsLoginOpen,
}: CartActionsProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const proceedToCheckout = () => {
    if (displayedCart.length === 0) {
      return toast.error(t("chooseAtLeastCart"));
    }

    if (userId) {
      router.push("/check-out", { locale });
    } else {
      setIsLoginOpen(true);
    }
  };

  return { proceedToCheckout };
}
