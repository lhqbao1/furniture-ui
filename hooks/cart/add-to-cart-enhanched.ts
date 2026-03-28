"use client";

import { useCartLocal } from "@/hooks/cart";
import { toast } from "sonner";
import { CartItemLocal } from "@/lib/utils/cart";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { calculateIncomingStockSummary } from "@/hooks/calculate_incoming_stock";

export function useAddToCartLocalEnhanced() {
  const TOAST_DURATION = 6000;
  const { addToCartLocal, cart } = useCartLocal();
  const t = useTranslations();

  const addToCartLocalOnly = (
    product: ProductItem,
    quantity: number = 1,
    options?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    if (!product) return;

    const existingItem = cart.find(
      (item: CartItemLocal) => item.product_id === product.id,
    );

    const totalQuantity = (existingItem?.quantity || 0) + quantity;

    const totalIncomingStock = calculateIncomingStockSummary(product).incomingStock;

    const baseStock = calculateAvailableStock(product);
    if (totalQuantity > baseStock + totalIncomingStock) {
      toast.error(t("notEnoughStock"), { duration: TOAST_DURATION });
      options?.onError?.();
      return;
    }

    addToCartLocal(
      {
        item: {
          product_id: product.id,
          quantity,
          is_active: true,
          item_price: product.final_price,
          final_price: product.final_price,
          img_url: product.static_files?.[0]?.url ?? "",
          product_name: product.name,
          brand_name: product.brand.name,
          stock: product.stock,
          inventory: product.inventory_pos,
          carrier: product.carrier ?? "amm",
          id_provider: product.id_provider ?? "",
          delivery_time: product.delivery_time ?? "",
          length: product.length,
          width: product.width,
          height: product.height,
          color: product.color,
          url_key: product.url_key,
          result_stock: product.result_stock ?? 0,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("addToCartSuccess"), { duration: TOAST_DURATION });
          options?.onSuccess?.();
        },
        onError: () => {
          toast.error(t("addToCartFail"), { duration: TOAST_DURATION });
          options?.onError?.();
        },
      },
    );
  };

  return { addToCartLocalOnly };
}
