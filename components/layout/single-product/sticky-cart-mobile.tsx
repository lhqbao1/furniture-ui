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
          {oldPrice && oldPrice > price && (
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
            {/* <Button
              type="button"
              className="px-4 bg-primary hover:bg-primary/90 text-white w-full h-full uppercase text-lg"
              onClick={() => {
                onAddToCart?.(); // ✅ gọi hàm
                router.push("/cart", { locale });
              }}
            >
              {t("addToCart")}
            </Button> */}
            {maxStock > 0 ? (
              <Button
                className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base lg:min-h-[40px] lg:h-fit !h-[40px] w-full"
                type="button"
                onClick={() => {
                  onAddToCart?.(); // ✅ gọi hàm
                  router.push("/cart", { locale });
                }}
                // disabled={productDetails.stock > 0 ? false : true}
              >
                {/* {productDetails.stock > 0 ? t("addToCart") : t("outStock")} */}
                {t("addToCart")}
              </Button>
            ) : (
              <Button
                className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base w-full lg:min-h-[40px] lg:h-fit !h-[40px] bg-gray-500 text-white cursor-not-allowed"
                type="button"
                disabled
                // disabled={productDetails.stock > 0 ? false : true}
              >
                {/* {productDetails.stock > 0 ? t("addToCart") : t("outStock")} */}
                {t("addToCart")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
