"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CartItemLocal } from "@/lib/utils/cart";
import { CartResponseItem } from "@/types/cart";
import { useTranslations } from "next-intl";
import React from "react";
import { useFormContext } from "react-hook-form";

interface CheckoutSummaryProps {
  cartItems: CartResponseItem[];
  localCart: CartItemLocal[];
  hasOtherCarrier: boolean;
  shippingCost: number;
}

const CheckoutSummary = ({
  cartItems,
  localCart,
  hasOtherCarrier,
  shippingCost,
}: CheckoutSummaryProps) => {
  const form = useFormContext();
  const t = useTranslations();

  const couponAmount = form.watch("coupon_amount");
  const voucherAmount = form.watch("voucher_amount");
  return (
    <>
      {/* TOTAL + NOTE */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* NOTE */}
        <div className="col-span-2 lg:col-span-1">
          <FormField
            name="note"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-lg font-semibold">
                  {t("note")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-20"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* TOTAL */}
        <div className="text-sm space-y-2 col-span-2 lg:col-span-1">
          {/* subtotal */}
          <div className="grid grid-cols-5">
            <span className="col-span-3 text-right">
              {t("subTotalInclude")}
            </span>
            <span className="text-right col-span-2">
              €
              {(cartItems && cartItems.length > 0
                ? cartItems
                    .flatMap((g) => g.items)
                    .filter((i) => i.is_active)
                    .reduce((s, i) => s + (i.final_price ?? 0), 0)
                : localCart
                    ?.filter((i) => i.is_active)
                    .reduce(
                      (s, i) => s + (i.item_price ?? 0) * (i.quantity ?? 1),
                      0,
                    ) ?? 0
              ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* shipping */}
          <div className="grid grid-cols-5">
            <span className="col-span-3 text-right">
              {hasOtherCarrier ? t("shippingSpedition") : t("shipping")}
            </span>
            <span className="text-right col-span-2">
              €
              {shippingCost.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* discount */}
          <div className="grid grid-cols-5">
            <span className="col-span-3 text-right">{t("discount")}</span>
            <span className="text-right col-span-2">€0</span>
          </div>

          {/* TOTAL */}
          <div className="grid grid-cols-5 text-xl text-primary font-bold">
            <span className="col-span-3 text-right">{t("total")}</span>
            <span className="text-right col-span-2">
              €
              {(
                (cartItems && cartItems.length > 0
                  ? cartItems
                      .flatMap((g) => g.items)
                      .filter((i) => i.is_active)
                      .reduce((s, i) => s + (i.final_price ?? 0), 0)
                  : localCart
                      ?.filter((i) => i.is_active)
                      .reduce(
                        (s, i) => s + (i.item_price ?? 0) * (i.quantity ?? 1),
                        0,
                      ) ?? 0) +
                shippingCost -
                (couponAmount ?? 0) -
                (voucherAmount ?? 0)
              ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutSummary;
