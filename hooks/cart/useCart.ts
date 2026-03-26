"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deleteCartItem, getCartItems } from "@/features/cart/api";
import { useCartLocal } from "@/hooks/cart";
import { CartItemLocal, removeFromLocalCart } from "@/lib/utils/cart";
import { toast } from "sonner";
import { CartItem, CartResponse, CartResponseItem } from "@/types/cart";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { calculateIncomingStockSummary } from "@/hooks/calculate_incoming_stock";
import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/features/products/api";

interface CartActionsProps {
  userId: string | null;
  displayedCart: CartResponse | CartItemLocal[];
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCartData() {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const { cart: localCart, updateStatus } = useCartLocal();

  const { data: cart, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart-items", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await getCartItems();
      const safe = Array.isArray(response) ? response : [];

      return safe
        .map((g) => ({
          ...g,
          items: Array.isArray(g.items) ? g.items : [],
        }))
        .sort((a, b) => {
          const latestA = Math.max(
            ...(a.items.map((i) => new Date(i.created_at).getTime()) ?? [0]),
          );
          const latestB = Math.max(
            ...(b.items.map((i) => new Date(i.created_at).getTime()) ?? [0]),
          );
          return latestB - latestA;
        });
    },
  });

  const displayedCart = useMemo(
    () => (userId ? (cart ?? []) : localCart),
    [userId, cart, localCart],
  );

  const total = useMemo(() => {
    if (userId) {
      if (!cart || isLoadingCart) return 0;
    }

    if (userId && cart) {
      return cart
        .flatMap((g) => g.items)
        .filter((i) => i.is_active)
        .reduce((acc, item) => {
          const key = item.id;
          const qty = localQuantities[key] ?? item.quantity;
          return acc + qty * item.item_price;
        }, 0);
    } else {
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
    }
  }, [userId, cart, isLoadingCart, localCart, localQuantities]);

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
  const queryClient = useQueryClient();

  const getServerActiveItems = () => {
    const groups = (Array.isArray(displayedCart) ? displayedCart : []).filter(
      (item): item is CartResponseItem =>
        !!item && Array.isArray((item as CartResponseItem).items),
    );

    return groups
      .flatMap((group) => group.items ?? [])
      .filter((item): item is CartItem => !!item && item.is_active);
  };

  const getLocalActiveItems = () => {
    const items = (Array.isArray(displayedCart) ? displayedCart : []).filter(
      (item): item is CartItemLocal =>
        !!item && !Array.isArray((item as CartResponseItem).items),
    );

    return items.filter((item) => item.is_active);
  };

  const proceedToCheckout = async () => {
    if (userId) {
      const activeItems = getServerActiveItems();
      if (activeItems.length === 0) {
        toast.error(t("chooseAtLeastCart"));
        return;
      }

      const invalidItems = activeItems.filter((item) => {
        const isProductActive = item.products?.is_active === true;
        if (!isProductActive) return true;

        const baseStock = calculateAvailableStock(item.products);
        const incomingStock = calculateIncomingStockSummary(
          item.products,
        ).incomingStock;
        const maxStock = Math.max(0, baseStock + incomingStock);
        return maxStock <= 0 || item.quantity > maxStock;
      });

      if (invalidItems.length > 0) {
        for (const item of invalidItems) {
          const isProductActive = item.products?.is_active === true;
          const itemLabel = item.products?.name ?? item.products?.sku ?? "Produkt";
          const removeReason = isProductActive
            ? `${t("notEnoughStock")}. Aus dem Warenkorb entfernt.`
            : "Dieses Produkt ist inaktiv. Aus dem Warenkorb entfernt.";

          try {
            await deleteCartItem(item.id);
            toast.error(`${itemLabel}: ${removeReason}`);
          } catch {
            toast.error(
              `${itemLabel}: ${
                isProductActive
                  ? t("notEnoughStock")
                  : "Dieses Produkt ist inaktiv"
              }. Konnte nicht automatisch aus dem Warenkorb entfernt werden.`,
            );
          }
        }

        await queryClient.invalidateQueries({
          queryKey: ["cart-items", userId],
        });
        await queryClient.invalidateQueries({ queryKey: ["cart-items"] });
        return;
      }

      router.push("/check-out", { locale });
      return;
    }

    const activeItems = getLocalActiveItems();
    if (activeItems.length === 0) {
      toast.error(t("chooseAtLeastCart"));
      return;
    }

    const localValidationResults = await Promise.all(
      activeItems.map(async (item) => {
        try {
          const latestProduct = await getProductById(item.product_id);
          const isProductActive = latestProduct?.is_active === true;
          const baseStock = calculateAvailableStock(latestProduct);
          const incomingStock = calculateIncomingStockSummary(
            latestProduct,
          ).incomingStock;
          const maxStock = Math.max(0, baseStock + incomingStock);

          if (!isProductActive) {
            return {
              item,
              isValid: false,
              reason: "inactive" as const,
              label:
                latestProduct?.name ??
                item.product_name ??
                item.id_provider ??
                "Produkt",
            };
          }

          if (maxStock <= 0 || item.quantity > maxStock) {
            return {
              item,
              isValid: false,
              reason: "stock" as const,
              label:
                latestProduct?.name ??
                item.product_name ??
                item.id_provider ??
                "Produkt",
            };
          }

          return {
            item,
            isValid: true,
            reason: "ok" as const,
            label:
              latestProduct?.name ??
              item.product_name ??
              item.id_provider ??
              "Produkt",
          };
        } catch {
          return {
            item,
            isValid: false,
            reason: "check_failed" as const,
            label: item.product_name ?? item.id_provider ?? "Produkt",
          };
        }
      }),
    );

    const checkFailedItems = localValidationResults.filter(
      (result) => result.reason === "check_failed",
    );
    if (checkFailedItems.length > 0) {
      toast.error(
        "Der Bestand einiger Warenkorb-Artikel konnte nicht geprüft werden. Bitte erneut versuchen.",
      );
      return;
    }

    const invalidItems = localValidationResults.filter(
      (result) => !result.isValid && result.reason !== "check_failed",
    );

    if (invalidItems.length > 0) {
      let latestLocalCart: CartItemLocal[] = [];
      for (const result of invalidItems) {
        latestLocalCart = removeFromLocalCart(result.item.product_id);
        toast.error(`${result.label}: ${
          result.reason === "inactive"
            ? "Dieses Produkt ist inaktiv"
            : t("notEnoughStock")
        }. Aus dem Warenkorb entfernt.`);
      }

      queryClient.setQueryData(["cart"], latestLocalCart);
      return;
    }

    setIsLoginOpen(true);
  };

  return { proceedToCheckout };
}
