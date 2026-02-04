"use client";
import { ProductItem } from "@/types/products";
import React from "react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useAddToWishList } from "@/features/wishlist/hook";
import { toast } from "sonner";
import { HandleApiError } from "@/lib/api-helper";
import { useRouter } from "@/src/i18n/navigation";
import { formatEUR } from "@/lib/format-euro";

interface ProductPricingFieldProps {
  product: ProductItem;
  isProductDetails?: boolean;
}

const ProductPricingField = ({
  product,
  isProductDetails,
}: ProductPricingFieldProps) => {
  const t = useTranslations();
  const addToWishlistMutation = useAddToWishList();
  const router = useRouter();
  const locale = useLocale();
  const basePrice = product.final_price ?? 0;
  // Voucher price adjustments + animations removed (not needed anymore).
  // If you want to restore later:
  // - matchedVoucher lookup
  // - priceAfterVoucher calculation
  // - CountUp animation
  // - GSAP animation on voucherRef

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
          toast.error(message);
          if (status === 401) router.push("/login", { locale });
        },
      },
    );
  };

  return (
    <div className="w-full">
      <div className="flex lg:flex-row flex-col lg:justify-start lg:gap-4 lg:items-end items-start">
        <div
          className={cn(
            `text-sm md:text-2xl lg:text-3xl flex items-end font-semibold pt-1 md:mt-0`,
            isProductDetails ? "text-3xl" : "",
          )}
        >
          {basePrice.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <div className="text-sm md:text-base font-semibold text-black">€</div>
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
              {!product.owner || product.owner.business_name === "Prestige Home"
                ? t("ogPrice")
                : t("ogPriceSupplier")}
              :{formatEUR(product.price)}
            </p>
          )}
      </div>

      {!isProductDetails && (
        <div className="flex items-center justify-between">
          <p className="font-light text-xs md:text-sm mt-1.5">
            zzgl. Versandkosten
          </p>
          <Heart
            className="size-4 md:size-6 text-secondary hover:fill-secondary cursor-pointer"
            onClick={() => handleAddToWishlist(product)}
          />
        </div>
      )}
    </div>
  );
};

export default ProductPricingField;
