"use client";
import { currentVoucherAtom, lastVoucherAtom } from "@/store/voucher";
import { ProductItem } from "@/types/products";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useRef } from "react";
import CountUp from "../CountUp";
import { usePrevious } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import gsap from "gsap";

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
    <div className="flex md:flex-row flex-col-reverse gap-2 md:items-end justify-start">
      <div className="">
        {/* <div className="text-4xl">
                        {Math.floor(priceAfterVoucher ? priceAfterVoucher : 0)}
                      </div>
                      <div className="text-base font-bold text-gray-700 absolute top-0 right-2.5">
                        ,
                        {
                          (
                            (priceAfterVoucher
                              ? priceAfterVoucher
                              : product.price) % 1
                          )
                            .toFixed(2)
                            .split(".")[1]
                        }
                      </div> */}
        <div className="inline-flex items-end justify-start w-fit gap-2 font-bold text-gray-900 relative">
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
            <div className="text-xl md:text-2xl lg:text-3xl">
              {priceAfterVoucher.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          <div className="text-base font-semibold text-black">€</div>
        </div>
        {!isProductDetails && (
          <p className="font-light text-xs md:text-sm">zzgl. Versandkosten</p>
        )}
      </div>

      {/* 🎯 VOUCHER */}
    </div>
  );
};

export default ProductPricingField;
