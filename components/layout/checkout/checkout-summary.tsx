"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetVoucherById,
  useGetVoucherForCheckout,
} from "@/features/vouchers/hook";
import { CartItemLocal } from "@/lib/utils/cart";
import { userIdAtom } from "@/store/auth";
import { CartResponseItem } from "@/types/cart";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import ProductVoucher from "./checkout-voucher";
import { voucherIdAtom } from "@/store/voucher";

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
  const [userId, setUserId] = useAtom(userIdAtom);
  const [voucherId, setVoucherId] = useState<string | null>(null);

  const voucherAmount = useWatch({
    control: form.control,
    name: "voucher_amount",
  });

  const couponAmount = useWatch({
    control: form.control,
    name: "coupon_amount",
  });

  const currentVoucherAmount = form.getValues("voucher_amount");

  const productIds = React.useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems
        .flatMap((g) => g.items)
        .filter((i) => i.is_active)
        .map((i) => i.products?.id) // ✅ lấy từ products
        .filter(Boolean); // ✅ bỏ undefined
    }

    return localCart?.filter((i) => i.is_active).map((i) => i.product_id) ?? [];
  }, [cartItems, localCart]);

  const orderValue = React.useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems
        .flatMap((g) => g.items)
        .filter((i) => i.is_active)
        .reduce((s, i) => s + (i.final_price ?? 0), 0);
    }

    return (
      localCart
        ?.filter((i) => i.is_active)
        .reduce((s, i) => s + (i.item_price ?? 0) * (i.quantity ?? 1), 0) ?? 0
    );
  }, [cartItems, localCart]);

  const carrier = React.useMemo<"dpd" | "amm" | undefined>(() => {
    if (shippingCost === 35.95) return "amm";
    if (shippingCost === 5.95) return "dpd";
    return undefined;
  }, [shippingCost]);

  const { data: listVouchers, isLoading } = useGetVoucherForCheckout(
    {
      product_ids: productIds,
      user_id: userId,
      carrier,
      order_value: orderValue,
    },
    true,
  );

  const { data: selectedVoucher, isLoading: isLoadingVoucher } =
    useGetVoucherById(voucherId ?? "");

  React.useEffect(() => {
    if (!selectedVoucher) return;

    const currentValue = form.getValues("voucher_amount");
    let nextValue = 0;

    /**
     * 1️⃣ PRODUCT voucher
     * - áp dụng trên orderValue (hoặc subtotal product)
     */
    if (selectedVoucher.type === "product") {
      if (selectedVoucher.discount_type === "percent") {
        nextValue = (orderValue * selectedVoucher.discount_value) / 100;
      }

      if (selectedVoucher.discount_type === "fixed") {
        nextValue = selectedVoucher.discount_value;
      }
    }

    /**
     * 2️⃣ USER SPECIFIC voucher
     * - logic giống order (thường vậy)
     */
    if (selectedVoucher.type === "user_specific") {
      if (selectedVoucher.discount_type === "percent") {
        nextValue = (orderValue * selectedVoucher.discount_value) / 100;
      }

      if (selectedVoucher.discount_type === "fixed") {
        nextValue = selectedVoucher.discount_value;
      }
    }

    /**
     * 3️⃣ SHIPPING voucher
     */
    if (selectedVoucher.type === "shipping") {
      if (selectedVoucher.discount_type === "percent") {
        nextValue = shippingCost;
        console.log(nextValue);
      }

      if (selectedVoucher.discount_type === "fixed") {
        nextValue = selectedVoucher.discount_value;
        console.log(nextValue);
      }
    }

    /**
     * 4️⃣ Respect max_discount (RẤT QUAN TRỌNG)
     */
    if (
      selectedVoucher.max_discount != null && // khác null & undefined
      selectedVoucher.max_discount > 0 && // loại bỏ 0
      nextValue > selectedVoucher.max_discount
    ) {
      nextValue = selectedVoucher.max_discount;
    }

    /**
     * 5️⃣ SET VALUE – CHỈ KHI THAY ĐỔI
     */
    if (!currentValue || currentValue !== nextValue) {
      console.log("hehe", nextValue);
      form.setValue("voucher_amount", nextValue, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [selectedVoucher, orderValue, shippingCost]); // ✅ KHÔNG đưa form vào deps

  React.useEffect(() => {
    if (!voucherId) {
      const current = form.getValues("voucher_amount");
      if (current !== 0) {
        form.setValue("voucher_amount", 0, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }
  }, [voucherId]);

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
            <span className="text-right col-span-2">
              €
              {voucherAmount
                ? voucherAmount.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                  })
                : 0}
            </span>
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
                Number(couponAmount || 0) -
                Number(voucherAmount || 0)
              ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2">
        {listVouchers && listVouchers.length > 0
          ? listVouchers.map((item, index) => {
              return (
                <ProductVoucher
                  item={item}
                  key={item.id}
                  isSelected={voucherId === item.id}
                  onSelect={() => setVoucherId(item.id)}
                />
              );
            })
          : null}
      </div>
    </>
  );
};

export default CheckoutSummary;
