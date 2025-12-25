"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";

interface MobileStickyCartProps {
  price: number;
  oldPrice?: number;
  onAddToCart?: () => void;
}

export default function MobileStickyCart({
  price,
  oldPrice,
  onAddToCart,
}: MobileStickyCartProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 z-50 w-full bg-white border-t shadow-lg",
        "md:hidden",
      )}
    >
      <div className="px-4 py-3">
        {/* Price */}
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            {t("productPrice")}
          </span>

          <div className="flex items-center gap-2">
            {oldPrice && (
              <span className="text-sm line-through text-gray-400">
                €
                {oldPrice.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
            <span className="text-lg font-semibold text-secondary">
              €
              {price.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            className="h-10 px-4 text-black"
            onClick={onAddToCart}
            variant={"outline"}
            type="button"
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {t("addToCart")}
          </Button>
          <Button
            type="button"
            className="h-10 px-4 bg-secondary/80 hover:bg-secondary text-white"
            onClick={() => {
              onAddToCart?.(); // ✅ gọi hàm
              router.push("/cart", { locale });
            }}
          >
            <ShoppingBag className="mr-1 h-4 w-4" />
            {t("buyNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
