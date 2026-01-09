"use client";

import { BadgePercent, Lock, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartResponse } from "@/types/cart";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useAtom } from "jotai";
import { authHydratedAtom, userIdAtom } from "@/store/auth";
import CartSummarySkeleton from "./skeleton/cart-summary-price-skeleton";
import VoucherApply from "../checkout/voucher-apply";
import React, { useState } from "react";
import { currentVoucherAtom } from "@/store/voucher";
import { VoucherItem } from "@/types/voucher";
import { useCartLocal } from "@/hooks/cart";
import {
  useGetVoucherById,
  useGetVoucherProducts,
} from "@/features/vouchers/hook";
import { useCheckoutInit } from "@/hooks/checkout/useCheckoutInit";

interface CartSummaryProps {
  total?: number;
  onApplyCoupon?: (code: string) => void;
  onCheckout?: () => void;
  cart?: CartResponse;
  shipping: number;
  isLoadingCart?: boolean;
  userId?: string;
  authHydrated?: boolean;
}

const CartSummary = ({
  total = 0,
  onApplyCoupon,
  onCheckout,
  cart,
  shipping,
  isLoadingCart,
  userId,
  authHydrated,
}: CartSummaryProps) => {
  const t = useTranslations();
  const [currentVoucher, setCurrentVoucher] = useAtom(currentVoucherAtom);
  const [voucherId, setVoucherId] = useState<string | null>(currentVoucher);
  const [discount, setDiscount] = React.useState<number>(0);

  const { cart: localCart } = useCartLocal();

  const { shippingCost } = useCheckoutInit();

  const orderValue = React.useMemo(() => {
    if (userId && cart && cart.length > 0) {
      return cart
        .flatMap((g) => g.items)
        .filter((i) => i.is_active)
        .reduce((s, i) => s + (i.final_price ?? 0), 0);
    }

    return (
      localCart
        ?.filter((i) => i.is_active)
        .reduce((s, i) => s + (i.item_price ?? 0) * (i.quantity ?? 1), 0) ?? 0
    );
  }, [cart, localCart]);

  const { data: selectedVoucher, isLoading: isLoadingVoucher } =
    useGetVoucherById(currentVoucher ?? "");
  const { data: listValidProducts } = useGetVoucherProducts(voucherId ?? "");

  const validProductIdSet = React.useMemo<Set<string>>(() => {
    return new Set(listValidProducts?.map((p) => p.id) ?? []);
  }, [listValidProducts]);

  const productSubtotalForVoucher = React.useMemo(() => {
    if (validProductIdSet.size === 0) return 0;

    // ✅ Logged-in cart
    if (cart && cart.length > 0) {
      return cart
        .flatMap((g) => g.items)
        .filter(
          (i) =>
            i.is_active &&
            i.products?.id &&
            validProductIdSet.has(i.products.id),
        )
        .reduce((sum, i) => sum + (i.final_price ?? 0), 0);
    }

    // ✅ Local cart
    return (
      localCart
        ?.filter((i) => i.is_active && validProductIdSet.has(i.product_id))
        .reduce((sum, i) => sum + (i.item_price ?? 0) * (i.quantity ?? 1), 0) ??
      0
    );
  }, [validProductIdSet, cart, localCart]);

  React.useEffect(() => {
    // ❌ Không có voucher
    if (!selectedVoucher) {
      setDiscount(0);
      return;
    }

    // ⛔ Product voucher nhưng chưa load danh sách product
    if (selectedVoucher.type === "product" && !listValidProducts) {
      return;
    }

    let nextDiscount = 0;

    /**
     * 1️⃣ PRODUCT voucher
     */
    if (selectedVoucher.type === "product") {
      if (productSubtotalForVoucher <= 0) {
        nextDiscount = 0;
      } else if (selectedVoucher.discount_type === "percent") {
        nextDiscount =
          (productSubtotalForVoucher * selectedVoucher.discount_value) / 100;
      } else {
        nextDiscount = selectedVoucher.discount_value;
      }
    }

    /**
     * 2️⃣ USER SPECIFIC voucher
     */
    if (selectedVoucher.type === "user_specific") {
      nextDiscount =
        selectedVoucher.discount_type === "percent"
          ? (orderValue * selectedVoucher.discount_value) / 100
          : selectedVoucher.discount_value;
    }

    /**
     * 3️⃣ SHIPPING voucher
     */
    if (selectedVoucher.type === "shipping") {
      nextDiscount =
        selectedVoucher.discount_type === "percent"
          ? shippingCost
          : selectedVoucher.discount_value;
    }

    /**
     * 4️⃣ max_discount
     */
    if (
      selectedVoucher.max_discount &&
      nextDiscount > selectedVoucher.max_discount
    ) {
      nextDiscount = selectedVoucher.max_discount;
    }

    // ✅ SET LOCAL STATE ONLY
    setDiscount(nextDiscount);
  }, [
    selectedVoucher,
    orderValue,
    shippingCost,
    productSubtotalForVoucher,
    listValidProducts,
  ]);

  const totalWithDiscount = Math.max(0, total + shipping - discount);

  return (
    <div className="border-0 shadow-none sticky top-6">
      <h3 className="text-3xl font-normal">Bestellübersicht</h3>

      <div className="pb-10 border-b mt-18">
        {!authHydrated || (userId && isLoadingCart) ? (
          <CartSummarySkeleton />
        ) : (
          <div className="space-y-2 text-base">
            {/* Subtotal */}
            <div className="flex justify-between">
              <span className="text-gray-700">{t("subtotal")}</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between">
              <span className="text-gray-700">{t("shipping")}</span>
              <span>{shipping.toFixed(2)} €</span>
            </div>

            {/* Shipping */}
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-secondary underline cursor-pointer">
                  {t("discount")}
                </span>
                <span className="text-secondary">-{discount.toFixed(2)} €</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between font-semibold text-base">
              <span>{t("totalWithTax")}</span>
              <span>{totalWithDiscount.toFixed(2)} €</span>
            </div>
          </div>
        )}

        <Button
          onClick={onCheckout}
          className="
          w-full
          h-14
          mt-6
          rounded-sm
          bg-secondary
          text-white
          text-base
          tracking-wide
          transition-all
          duration-200
          hover:bg-secondary/90
          active:scale-[0.98]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-secondary
          focus-visible:ring-offset-2
        "
        >
          {t("proceedToCheckout")}
        </Button>
      </div>

      <div className="py-10 space-y-4 border-b">
        {/* Secure payment */}
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-gray-700" />
          <span className="text-gray-500">{t("securePayment")}</span>
        </div>

        {/* Easy delivery */}
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-gray-700" />
          <span className="text-gray-500">{t("easyDelivery")}</span>
        </div>
      </div>

      {/* <div className="py-10 space-y-4 border-b">
        <VoucherApply
          voucherId={voucherId}
          setVoucherId={setVoucherId}
        />
      </div> */}

      <div className="pt-10">
        <p>Wir akzeptieren</p>
        <div className="flex gap-2 mt-2 lg:mt-4 flex-wrap">
          <Image
            src="/footer-ggpay.svg"
            width={50}
            height={50}
            alt="x"
            className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
            unoptimized
          />
          <Image
            src="/footer-applepay.svg"
            width={50}
            height={50}
            alt="x"
            className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
            unoptimized
          />
          <Image
            src="/footer-visa.svg"
            width={50}
            height={50}
            alt="x"
            className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
            unoptimized
          />
          <Image
            src="/footer-mastercard.svg"
            width={50}
            height={50}
            alt="x"
            className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
            unoptimized
          />
          <Image
            src="/footer-klarna.svg"
            width={50}
            height={50}
            alt="x"
            className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
            unoptimized
          />
          <Image
            src="/footer-paypal.svg"
            width={50}
            height={50}
            alt="x"
            className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
