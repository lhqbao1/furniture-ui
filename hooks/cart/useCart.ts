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
import type { ProductItem } from "@/types/products";

interface CartActionsProps {
  userId: string | null;
  displayedCart: CartResponse | CartItemLocal[];
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type ProductWithIncomingAliases = ProductItem & {
  inventories_po?: ProductItem["inventory_pos"] | null;
  inventory_po?: ProductItem["inventory_pos"] | null;
};

type CartValidationReason = "ok" | "inactive" | "stock" | "check_failed";

const normalizeProductForCartValidation = (
  product?: ProductItem | null,
): ProductItem | null => {
  if (!product) return null;

  const productWithAliases = product as ProductWithIncomingAliases;

  return {
    ...product,
    inventory_pos:
      product.inventory_pos ??
      productWithAliases.inventories_po ??
      productWithAliases.inventory_po ??
      [],
  };
};

const getProductLabel = (
  latestProduct?: ProductItem | null,
  fallback?: Partial<ProductItem> | CartItemLocal | null,
) => {
  if (latestProduct?.name) return latestProduct.name;
  if (!fallback) return "Produkt";
  if ("product_name" in fallback) {
    return fallback.product_name ?? fallback.id_provider ?? "Produkt";
  }
  return fallback?.name ?? fallback?.sku ?? "Produkt";
};

const validateProductCartQuantity = (
  product: ProductItem | null,
  quantity: unknown,
): CartValidationReason => {
  const requestedQuantity = Number(quantity) || 0;
  const isProductActive = product?.is_active === true;
  const baseStock = calculateAvailableStock(product);
  const incomingStock = calculateIncomingStockSummary(product).incomingStock;
  const maxStock = Math.max(0, baseStock + incomingStock);

  if (!isProductActive) {
    return "inactive";
  }

  if (maxStock <= 0 || requestedQuantity > maxStock) {
    return "stock";
  }

  return "ok";
};

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

      const serverValidationResults = await Promise.all(
        activeItems.map(async (item) => {
          try {
            const latestProduct = normalizeProductForCartValidation(
              await getProductById(item.products.id),
            );
            const label = getProductLabel(latestProduct, item.products);
            const reason = validateProductCartQuantity(
              latestProduct,
              item.quantity,
            );

            if (reason !== "ok") {
              return {
                item,
                isValid: false,
                reason,
                label,
              };
            }

            return {
              item,
              isValid: true,
              reason: "ok" as CartValidationReason,
              label,
            };
          } catch {
            return {
              item,
              isValid: false,
              reason: "check_failed" as CartValidationReason,
              label: getProductLabel(null, item.products),
            };
          }
        }),
      );

      const checkFailedItems = serverValidationResults.filter(
        (result) => result.reason === "check_failed",
      );
      if (checkFailedItems.length > 0) {
        toast.error(
          "Der Bestand einiger Warenkorb-Artikel konnte nicht geprüft werden. Bitte erneut versuchen.",
        );
        return;
      }

      const invalidItems = serverValidationResults.filter(
        (result) => !result.isValid,
      );

      if (invalidItems.length > 0) {
        for (const result of invalidItems) {
          const removeReason = result.reason === "stock"
            ? `${t("notEnoughStock")}. Aus dem Warenkorb entfernt.`
            : "Dieses Produkt ist inaktiv. Aus dem Warenkorb entfernt.";

          try {
            await deleteCartItem(result.item.id);
            toast.error(`${result.label}: ${removeReason}`);
          } catch {
            toast.error(
              `${result.label}: ${
                result.reason === "stock"
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
          const latestProduct = normalizeProductForCartValidation(
            await getProductById(item.product_id),
          );
          const reason = validateProductCartQuantity(
            latestProduct,
            item.quantity,
          );

          if (reason !== "ok") {
            return {
              item,
              isValid: false,
              reason,
              label: getProductLabel(latestProduct, item),
            };
          }

          return {
            item,
            isValid: true,
            reason: "ok" as const,
            label: getProductLabel(latestProduct, item),
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
