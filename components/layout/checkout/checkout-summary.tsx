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
  useGetVoucherProducts,
} from "@/features/vouchers/hook";
import { CartItemLocal } from "@/lib/utils/cart";
import { userIdAtom } from "@/store/auth";
import { CartResponseItem } from "@/types/cart";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import ProductVoucher from "./checkout-voucher";
import { currentVoucherAtom } from "@/store/voucher";
import { BadgePercent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VoucherApply from "./voucher-apply";

interface CheckoutSummaryProps {
  cartItems: CartResponseItem[];
  localCart: CartItemLocal[];
  hasOtherCarrier: boolean;
  shippingCost: number;
  userLoginId: string | null;
}

const CheckoutSummary = ({
  cartItems,
  localCart,
  hasOtherCarrier,
  shippingCost,
  userLoginId,
}: CheckoutSummaryProps) => {
  const form = useFormContext();
  const t = useTranslations();
  const [currentVoucher, setCurrentVoucher] = useAtom(currentVoucherAtom);
  const [voucherId, setVoucherId] = useState<string | null>(currentVoucher);

  const hasServerCart =
    !!userLoginId && Array.isArray(cartItems) && cartItems.length > 0;

  const { data: listValidProducts } = useGetVoucherProducts(voucherId ?? "");

  const validProductIdSet = React.useMemo<Set<string>>(() => {
    return new Set(listValidProducts?.map((p) => p.id) ?? []);
  }, [listValidProducts]);

  const productSubtotalForVoucher = React.useMemo(() => {
    if (validProductIdSet.size === 0) return 0;

    if (hasServerCart) {
      return cartItems
        .flatMap((g) => g.items)
        .filter(
          (i) =>
            i.is_active &&
            i.products?.id &&
            validProductIdSet.has(i.products.id),
        )
        .reduce((sum, i) => sum + (i.final_price ?? 0), 0);
    }

    return (
      localCart
        ?.filter((i) => i.is_active && validProductIdSet.has(i.product_id))
        .reduce((sum, i) => sum + (i.item_price ?? 0) * (i.quantity ?? 1), 0) ??
      0
    );
  }, [validProductIdSet, cartItems, localCart, hasServerCart]);

  const voucherAmount = useWatch({
    control: form.control,
    name: "voucher_amount",
  });

  const couponAmount = useWatch({
    control: form.control,
    name: "coupon_amount",
  });

  const orderValue = React.useMemo(() => {
    if (hasServerCart) {
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
  }, [cartItems, localCart, hasServerCart]);

  // const carrier = React.useMemo<"dpd" | "amm" | undefined>(() => {
  //   if (shippingCost === 35.95) return "amm";
  //   if (shippingCost === 5.95) return "dpd";
  //   return undefined;
  // }, [shippingCost]);

  // const { data: listVouchers, isLoading } = useGetVoucherForCheckout(
  //   {
  //     product_ids: productIds,
  //     user_id: userId,
  //     carrier,
  //     order_value: orderValue,
  //   },
  //   true,
  // );

  const { data: selectedVoucher, isLoading: isLoadingVoucher } =
    useGetVoucherById(currentVoucher ?? "");

  React.useEffect(() => {
    if (!selectedVoucher) return;

    // ⛔ Product voucher nhưng chưa load products → STOP
    if (selectedVoucher.type === "product" && !listValidProducts) {
      return;
    }

    let nextValue = 0;
    const currentValue = form.getValues("voucher_amount");

    /**
     * 1️⃣ PRODUCT voucher
     */
    if (selectedVoucher.type === "product") {
      if (productSubtotalForVoucher <= 0) {
        nextValue = 0;
      } else if (selectedVoucher.discount_type === "percent") {
        nextValue =
          (productSubtotalForVoucher * selectedVoucher.discount_value) / 100;
      } else {
        nextValue = selectedVoucher.discount_value;
      }
    }

    /**
     * 2️⃣ USER SPECIFIC
     */
    if (
      selectedVoucher.type === "user_specific" ||
      selectedVoucher.type === "order"
    ) {
      nextValue =
        selectedVoucher.discount_type === "percent"
          ? (orderValue * selectedVoucher.discount_value) / 100
          : selectedVoucher.discount_value;
    }

    /**
     * 3️⃣ SHIPPING
     */
    if (selectedVoucher.type === "shipping") {
      nextValue =
        selectedVoucher.discount_type === "percent"
          ? shippingCost
          : selectedVoucher.discount_value;
    }

    /**
     * 4️⃣ max_discount
     */
    if (
      selectedVoucher.max_discount &&
      nextValue > selectedVoucher.max_discount
    ) {
      nextValue = selectedVoucher.max_discount;
    }

    /**
     * 5️⃣ SET VALUE
     */

    if (currentValue !== nextValue) {
      form.setValue("voucher_amount", nextValue, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [
    selectedVoucher,
    orderValue,
    shippingCost,
    productSubtotalForVoucher, // 🔥 BẮT BUỘC
    listValidProducts, // 🔥 BẮT BUỘC
  ]);

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
      <div className="space-y-4 flex justify-end xl:mb-8">
        <VoucherApply
          voucherId={voucherId}
          setVoucherId={setVoucherId}
        />
      </div>
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
              {(userLoginId && cartItems && cartItems.length > 0
                ? cartItems
                    .flatMap((g) => g.items)
                    .filter((i) => i.is_active)
                    .reduce((s, i) => s + (i.final_price ?? 0), 0)
                : (localCart
                    ?.filter((i) => i.is_active)
                    .reduce(
                      (s, i) => s + (i.item_price ?? 0) * (i.quantity ?? 1),
                      0,
                    ) ?? 0)
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
                (hasServerCart
                  ? cartItems
                      .flatMap((g) => g.items)
                      .filter((i) => i.is_active)
                      .reduce((s, i) => s + (i.final_price ?? 0), 0)
                  : (localCart
                      ?.filter((i) => i.is_active)
                      .reduce(
                        (s, i) => s + (i.item_price ?? 0) * (i.quantity ?? 1),
                        0,
                      ) ?? 0)) +
                shippingCost -
                Number(couponAmount || 0) -
                Number(voucherAmount || 0)
              ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutSummary;
