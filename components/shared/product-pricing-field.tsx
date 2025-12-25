"use client";
import { currentVoucherAtom, lastVoucherAtom } from "@/store/voucher";
import { ProductItem } from "@/types/products";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useRef } from "react";
import CountUp from "../CountUp";
import { usePrevious } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useTranslations } from "next-intl";

interface ProductPricingFieldProps {
  product: ProductItem;
  isProductDetails?: boolean;
}

const ProductPricingField = ({
  product,
  isProductDetails,
}: ProductPricingFieldProps) => {
  const [currentVoucher] = useAtom(currentVoucherAtom);
  const [lastVoucher, setLastVoucher] = useAtom(lastVoucherAtom);
  const t = useTranslations();
  const voucherRef = useRef<HTMLDivElement | null>(null);
  // ✅ check voucher match
  const matchedVoucher = product.vouchers?.find((v) => v.id === currentVoucher);

  const basePrice = product.final_price ?? 0;

  const priceAfterVoucher = useMemo(() => {
    if (!matchedVoucher) return basePrice;

    const { discount_type, discount_value } = matchedVoucher;

    let discountedPrice = basePrice;

    if (discount_type === "percent") {
      discountedPrice = basePrice * (1 - discount_value / 100);
    }

    if (discount_type === "fixed") {
      discountedPrice = basePrice - discount_value;
    }

    // không cho âm
    return Math.max(discountedPrice, 0);
  }, [basePrice, matchedVoucher]);

  const shouldAnimate = !!matchedVoucher && matchedVoucher.id !== lastVoucher;
  const prevPrice = usePrevious(priceAfterVoucher) ?? basePrice;

  /**
   * GSAP animation khi voucher xuất hiện / biến mất
   */
  useEffect(() => {
    if (!voucherRef.current) return;

    const el = voucherRef.current;
    let tween: gsap.core.Tween;

    if (matchedVoucher) {
      tween = gsap.fromTo(
        el,
        { x: 24, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.7)",
        },
      );
    } else {
      tween = gsap.to(el, {
        x: 24,
        opacity: 0,
        scale: 0.9,
        duration: 0.25,
        ease: "back.in(1.7)",
      });
    }

    return () => {
      tween?.kill(); // 🔥 cleanup
    };
  }, [matchedVoucher]);

  return (
    <>
      {shouldAnimate ? (
        <CountUp
          from={prevPrice}
          to={priceAfterVoucher}
          duration={0.8}
          className="text-3xl"
          startWhen={shouldAnimate}
          onEnd={() => {
            if (matchedVoucher) {
              setLastVoucher(matchedVoucher.id);
            }
          }}
        />
      ) : (
        <div className="flex lg:flex-row flex-col lg:justify-start lg:gap-4 lg:items-end items-start">
          <div className="text-sm md:text-2xl lg:text-3xl flex items-end font-semibold pt-1 md:mt-0">
            {priceAfterVoucher.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <div className="text-sm md:text-base font-semibold text-black">
              €
            </div>
          </div>
          {!isProductDetails &&
            product.price &&
            product.price > product.final_price && (
              <p className="text-[10px] md:text-base min-h-0 mb-0.5">
                {!product.owner ||
                product.owner.business_name === "Prestige Home"
                  ? t("ogPrice")
                  : t("ogPriceSupplier")}
                : €
                {product.price.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
        </div>
      )}

      {!isProductDetails && (
        <p className="font-light text-xs md:text-sm">zzgl. Versandkosten</p>
      )}
    </>
  );
};

export default ProductPricingField;
