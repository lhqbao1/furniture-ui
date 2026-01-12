"use client";

import { useCartLocal } from "@/hooks/cart";
import { toast } from "sonner";
import { CartItemLocal } from "@/lib/utils/cart";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";

export function useAddToCartLocalEnhanced() {
  const { addToCartLocal, cart } = useCartLocal();
  const t = useTranslations();

  const addToCartLocalOnly = (product: ProductItem, quantity: number = 1) => {
    if (!product) return;

    const existingItem = cart.find(
      (item: CartItemLocal) => item.product_id === product.id,
    );

    const totalQuantity = (existingItem?.quantity || 0) + quantity;

    const totalIncomingStock =
      product.inventory?.reduce(
        (sum, inv) => sum + (inv.incoming_stock ?? 0),
        0,
      ) ?? 0;

    if (totalQuantity > product.stock + totalIncomingStock) {
      toast.error(t("notEnoughStock"));
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
          inventory: product.inventory,
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
        onSuccess: () => toast.success(t("addToCartSuccess")),
        onError: () => toast.error(t("addToCartFail")),
      },
    );
  };

  return { addToCartLocalOnly };
}
