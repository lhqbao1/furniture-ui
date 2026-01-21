"use client";
import { currentVoucherAtom, lastVoucherAtom } from "@/store/voucher";
import { ProductItem } from "@/types/products";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useRef } from "react";
import CountUp from "../CountUp";
import { usePrevious } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { useAddToWishList } from "@/features/wishlist/hook";
import { toast } from "sonner";
import { HandleApiError } from "@/lib/api-helper";
import { useRouter } from "@/src/i18n/navigation";

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
  const addToWishlistMutation = useAddToWishList();
  const router = useRouter();
  const locale = useLocale();
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

  const handleAddToWishlist = (currentProduct: ProductItem) => {
    if (!currentProduct) return;
    addToWishlistMutation.mutate(
      { productId: currentProduct.id ?? "", quantity: 1 },
      {
        onSuccess(data, variables, context) {
          toast.success(t("addToWishlistSuccess"));
        },
        onError(error, variables, context) {
          const { status, message } = HandleApiError(error, t);
          // if (status === 400) {
          //   toast.error(t("notEnoughStock"));
          //   return;
          // }
          toast.error(message);
          if (status === 401) router.push("/login", { locale });
        },
      },
    );
  };

  return (
    <div className="w-full">
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
          <div
            className={cn(
              `text-sm md:text-2xl lg:text-3xl flex items-end font-semibold pt-1 md:mt-0`,
              isProductDetails ? "text-3xl" : "",
            )}
          >
            {priceAfterVoucher.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <div className="text-sm md:text-base font-semibold text-black">
              €
            </div>
            {isProductDetails && (
              <span className="text-sm text-gray-800 font-light ml-2">
                inkl. MwSt.
              </span>
            )}
          </div>
          {!isProductDetails &&
            product.price &&
            product.price > product.final_price && (
              <p className="text-[10px] md:text-sm min-h-0 mb-0.5 text-gray-700 font-light">
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
        <div className="flex items-center justify-between">
          <p className="font-light text-xs md:text-sm mt-1.5">
            zzgl. Versandkosten
          </p>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            aria-label="Add to cart"
            className="hover:bg-transparent"
            onClick={() => handleAddToWishlist(product)}
          >
            <Heart className="size-4 md:size-6 text-secondary group-hover:fill-secondary" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductPricingField;
