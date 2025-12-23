"use client";
import ProductPricingField from "@/components/shared/product-pricing-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/src/i18n/navigation";
import { ProductItem } from "@/types/products";
import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

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
}

const ComparePriceCard = ({
  product,
  isMarketplace,
  marketplacePrice,
  marketplace,
}: ComparePriceCardProps) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  return (
    <div
      className="relative group"
      key={product.id_provider}
    >
      <div
        key={product.id}
        className="relative z-10 h-full border boder-[#e0e0e0]"
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
                "text-lg text-black text-left line-clamp-2 lg:min-h-[80px] min-h-[52px]",
              )}
            >
              {product.name}
            </h3>

            <div className="space-y-2">
              {/* <ProductPricingField product={product} /> */}
              <div className="text-2xl">
                {(marketplacePrice
                  ? marketplacePrice
                  : product.final_price
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                €
              </div>
            </div>
          </div>

          {/* Four lines starting from center of each edge */}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
          <span className="absolute top-0 left-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
          <span className="absolute top-0 right-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300  group-hover:scale-x-100"></span>
          <span className="absolute bottom-0 right-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
        </div>
        {/* {isMarketplace && (
          <div className="space-x-3 mt-3 pb-4 lg:px-4 px-2">
            <Button
              type="button"
              variant={"ghost"}
              size={"lg"}
              aria-label="Add to cart"
              className="has-[>svg]:px-2 bg-secondary/90 hover:bg-secondary rounded-full group"
            >
              <Eye className="size-6 text-white transition-transform duration-200 group-hover:scale-110" />
            </Button>
          </div>
        )} */}
      </div>

      {isMarketplace ? (
        <div className="absolute top-0 right-1/2 -translate-y-1/2 translate-x-1/2 z-[1000]">
          <Image
            src={MARKETPLACE_ICON_MAP[marketplace ?? 0] ?? "/default.png"}
            alt={marketplace ?? ""}
            width={200}
            height={200}
            className="w-24 h-auto object-cover"
          />
        </div>
      ) : (
        <div className="absolute -top-2 right-1/2 -translate-y-1/2 translate-x-1/2 z-[1000]">
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
