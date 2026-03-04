"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCartData } from "@/hooks/cart/useCart";
import { flattenCartItems } from "@/hooks/cart/flattenCart";
import { CartItemLocal } from "@/lib/utils/cart";
import { ProductItem } from "@/types/products";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import Image from "next/image";
import { Check } from "lucide-react";
import React from "react";

interface PostAddToCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductItem;
  quantity: number;
}

const PostAddToCartDrawer = ({
  open,
  onOpenChange,
  product,
  quantity,
}: PostAddToCartDrawerProps) => {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { userId, cart, localCart, isLoadingCart } = useCartData();

  const serverItems = React.useMemo(() => flattenCartItems(cart ?? []), [cart]);
  const cartItems = React.useMemo(() => {
    if (userId) {
      return serverItems
        .filter((item) => item.is_active)
        .map((item) => ({
          key: item.id,
          name: item.products?.name ?? "",
          quantity: item.quantity ?? 0,
          itemPrice: Number(item.item_price ?? 0),
          imageUrl:
            item.image_url || item.products?.static_files?.[0]?.url || "",
        }));
    }

    return (localCart ?? [])
      .filter((item) => item.is_active)
      .map((item: CartItemLocal) => ({
        key: item.product_id,
        name: item.product_name ?? "",
        quantity: item.quantity ?? 0,
        itemPrice: Number(item.item_price ?? 0),
        imageUrl: item.img_url ?? "",
      }));
  }, [userId, serverItems, localCart]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-[560px] max-w-none h-[100vh] data-[vaul-drawer-direction=right]:sm:max-w-[560px] overflow-hidden data-[vaul-drawer-direction=right]:rounded-tl-3xl border-l border-gray-200 flex flex-col">
        <DrawerHeader className="border-b px-5 py-4">
          <DrawerTitle className="text-2xl font-semibold flex items-center gap-3 mb-0">
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-gray-300">
              <Check className="size-4" />
            </span>
            {t("addToCartSuccess")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-5 py-4 space-y-6 flex-1 min-h-0 flex flex-col">
          <div className="space-y-6 border-b pb-6">
            <div className="flex gap-3 bg-white">
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.static_files?.[0]?.url ?? "/fallback/no-img.png"}
                  alt={product.name ?? "Product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-semibold line-clamp-2 text-black">
                  {product.name ?? ""}
                </p>
                <div className="flex gap-4 items-end">
                  <p className="text-lg font-bold text-secondary">
                    €
                    {(
                      Number(product.final_price ?? 0) * quantity
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    x {quantity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isLoadingCart && cartItems.length > 0 && (
            <div className="space-y-3 flex-1 min-h-0 flex flex-col">
              <h4 className="text-2xl font-semibold">{t("cart")}</h4>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                {cartItems.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-lg border border-gray-200 px-3 py-2 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={item.imageUrl || "/fallback/no-img.png"}
                          alt={item.name || "Product"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          €
                          {item.itemPrice.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          x {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoadingCart && (
            <div className="space-y-3 flex-1 min-h-0 flex flex-col">
              <h4 className="text-2xl font-semibold">{t("cart")}</h4>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`cart-skeleton-${index}`}
                    className="border border-gray-200 rounded-lg px-3 py-2 bg-white animate-pulse"
                  >
                    <div className="h-4 w-11/12 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-7/12 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 pb-3 flex gap-3 mt-auto">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {t("continueShopping")}
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl text-base font-semibold"
              onClick={() => {
                onOpenChange(false);
                router.push("/cart", { locale });
              }}
            >
              {t("checkout")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostAddToCartDrawer;
