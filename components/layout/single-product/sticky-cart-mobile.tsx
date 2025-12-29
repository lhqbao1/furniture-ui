"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormQuantityInputMobile } from "./details/quantity-input-mobile";

interface MobileStickyCartProps {
  price: number;
  oldPrice?: number;
  onAddToCart?: () => void;
  maxStock: number;
}

export default function MobileStickyCart({
  price,
  oldPrice,
  onAddToCart,
  maxStock,
}: MobileStickyCartProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const form = useFormContext();

  const quantity = useWatch({
    control: form.control,
    name: "quantity",
    defaultValue: 1,
  });

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 z-50 w-full bg-white border-t shadow-lg",
        "md:hidden",
      )}
    >
      <div className="px-4 py-3">
        {/* Price */}
        <div className="flex gap-2 items-center justify-end">
          {oldPrice && (
            <div className="text-sm line-through text-gray-400">
              €
              {(oldPrice * quantity).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          <div className="text-lg font-semibold text-secondary">
            €
            {(price * quantity).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormQuantityInputMobile
                    value={field.value ?? 1}
                    onChange={field.onChange}
                    min={1}
                    max={maxStock}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 flex-1">
            {/* <Button
            className="h-10 px-4 text-black"
            onClick={onAddToCart}
            variant={"outline"}
            type="button"
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {t("addToCart")}
          </Button> */}
            <Button
              type="button"
              className="px-4 bg-primary hover:bg-primary/90 text-white w-full h-full uppercase text-lg"
              onClick={() => {
                onAddToCart?.(); // ✅ gọi hàm
                router.push("/cart", { locale });
              }}
            >
              {t("buyNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
