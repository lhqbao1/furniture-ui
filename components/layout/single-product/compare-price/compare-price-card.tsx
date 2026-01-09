"use client";
import ProductPricingField from "@/components/shared/product-pricing-field";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/features/cart/hook";
import { useCartLocal } from "@/hooks/cart";
import { HandleApiError } from "@/lib/api-helper";
import { cn } from "@/lib/utils";
import { CartItemLocal } from "@/lib/utils/cart";
import { Link, useRouter } from "@/src/i18n/navigation";
import { userIdAtom } from "@/store/auth";
import { ProductItem } from "@/types/products";
import { useAtom } from "jotai";
import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import RequestOfferDialog from "./request-offer-dialog";
import { hasRequestedVoucherAtom, voucherDialogAtom } from "@/store/voucher";
import VoucherApply from "../../checkout/voucher-apply";
import VoucherApplyComapre from "./voucher-apply";
import CountUp from "@/components/CountUp";
import { useAddToCartLocalEnhanced } from "@/hooks/cart/add-to-cart-enhanched";

const MARKETPLACE_ICON_MAP: Record<string, string> = {
  kaufland: "/kaufland-seeklogo.png",
  amazon: "/amazon.png",
  ebay: "/ebay.png",
};

interface ComparePriceCardProps {
  product: ProductItem;
  isMarketplace?: boolean;
  marketplacePrice?: number;
  marketplace?: string;
  className?: string;
  priceClassName?: string;
  isProductCheapest?: boolean;
  isProduct?: boolean;
}

const ComparePriceCard = ({
  product,
  isMarketplace,
  marketplacePrice,
  marketplace,
  className,
  priceClassName,
  isProductCheapest,
  isProduct,
}: ComparePriceCardProps) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [userId, setUserId] = useAtom(userIdAtom);
  const createCartMutation = useAddToCart();
  const [hasRequestedVoucher, setHasRequestedVoucher] = useAtom(
    hasRequestedVoucherAtom,
  );
  const [dialogStep, setDialogStep] = useAtom(voucherDialogAtom);
  const { addToCartLocalOnly } = useAddToCartLocalEnhanced();

  const handleAddToCart = (values: any) => {
    if (!product) return;

    // LOCAL CART
    if (!userId) {
      addToCartLocalOnly(product, values.quantity);
      return;
    }

    // SERVER CART
    createCartMutation.mutate(
      { productId: product.id, quantity: values.quantity },
      {
        onSuccess: () => toast.success(t("addToCartSuccess")),
        onError: (error) => {
          const { status, message } = HandleApiError(error, t);
          toast.error(message);
          if (status === 401) {
            router.push("/login", { locale });
          }
        },
      },
    );
  };

  return (
    <div
      className="relative group"
      key={product.id_provider}
    >
      <div
        key={product.id}
        className={cn("relative z-10 h-full border boder-[#e0e0e0]", className)}
      >
        <div className="bg-white p-0 group z-0 pt-8 lg:px-4 px-2">
          <Image
            width={200}
            height={200}
            src={
              product.static_files && product.static_files.length > 0
                ? product.static_files[0].url
                : "/placeholder-product.webp"
            }
            alt={product.name}
            className="w-full h-48 md:h-64 py-0 md:py-2 object-contain mb-2 rounded group-hover:scale-120 duration-500"
          />

          <div className="product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1">
            <h3
              className={cn(
                "md:text-lg text-base text-black text-left line-clamp-2 lg:min-h-[80px] min-h-[48px]",
              )}
            >
              {product.name}
            </h3>

            <div className="space-y-2">
              {/* <ProductPricingField product={product} /> */}
              {isProductCheapest && (
                <div
                  className="
                  absolute top-3 right-3
                  rounded-md
                  bg-green-500 text-white
                  text-xs font-semibold
                  px-3 py-1
                  shadow-md
                  z-10 pointer-events-none
                  flex gap-1 items-center
                "
                >
                  {t("best_price")}
                  <Image
                    src={"/award.png"}
                    width={15}
                    height={15}
                    alt=""
                  />
                </div>
              )}

              <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-2">
                {isProduct && dialogStep === "success" ? (
                  <>
                    <CountUp
                      from={product.final_price}
                      to={product.final_price - 10}
                      duration={0.8}
                      className="text-3xl"
                      startWhen={dialogStep === "success"}
                      // onEnd={() => {
                      //   if (matchedVoucher) {
                      //     setLastVoucher(matchedVoucher.id);
                      //   }
                      // }}
                    />
                    €
                  </>
                ) : (
                  <div className={cn("text-xl md:text-2xl", priceClassName)}>
                    {(marketplacePrice
                      ? marketplacePrice
                      : product.final_price
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    €
                  </div>
                )}

                {isProduct && isProductCheapest && (
                  <Button
                    className="rounded-md lg:px-4 mr-1 text-center justify-center text-sm"
                    type="button"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    {t("buyNow")}
                  </Button>
                )}

                {isProduct &&
                  !isProductCheapest &&
                  hasRequestedVoucher === false && (
                    <RequestOfferDialog
                      productName={product.name}
                      productUrl={`/product/${product.url_key}`}
                    />
                  )}
              </div>
            </div>
          </div>

          {/* Four lines starting from center of each edge */}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
          <span className="absolute top-0 left-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
          <span className="absolute top-0 right-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300  group-hover:scale-x-100"></span>
          <span className="absolute bottom-0 right-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
        </div>
      </div>

      {isMarketplace ? (
        <div className="absolute top-0 right-1/2 -translate-y-1/2 translate-x-1/2 z-20">
          <Image
            src={MARKETPLACE_ICON_MAP[marketplace ?? 0] ?? "/default.png"}
            alt={marketplace ?? ""}
            width={200}
            height={200}
            className="w-24 h-auto object-cover"
          />
        </div>
      ) : (
        <div className="absolute -top-2 right-1/2 -translate-y-1/2 translate-x-1/2 z-20">
          <Image
            src={"/invoice-logo.png"}
            height={20}
            width={60}
            alt=""
          />
        </div>
      )}
    </div>
  );
};

export default ComparePriceCard;
