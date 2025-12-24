"use client";

import { BadgePercent, Lock, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartResponse } from "@/types/cart";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useAtom } from "jotai";
import { authHydratedAtom, userIdAtom } from "@/store/auth";
import CartSummarySkeleton from "./skeleton/cart-summary-price-skeleton";

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
              <span className="text-secondary underline cursor-pointer">
                {t("shipping")}
              </span>
              <span>{shipping.toFixed(2)} €</span>
            </div>

            {/* Total */}
            <div className="flex justify-between font-semibold text-base">
              <span>{t("totalWithTax")}</span>
              <span>{(total + shipping).toFixed(2)} €</span>
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
