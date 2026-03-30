"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductItem } from "@/types/products";
import ComparePriceCard from "./compare-price-card";
import { useTranslations } from "next-intl";
import { ApplyVoucherDialog } from "./apply-voucher-dialog";
import { Scale } from "lucide-react";

interface ComparePriceSectionProps {
  product: ProductItem;
  open?: boolean; // 👈 control từ ngoài
}

function ComparePriceCardsSkeleton({ length = 4 }: { length?: number }) {
  return (
    <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:gap-8">
      {Array.from({ length }).map((_, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-xl border border-[#e6eaf0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
        >
          <Skeleton className="mx-auto mb-4 h-8 w-24 rounded-full" />

          <Skeleton className="h-56 w-full rounded-lg" />

          <div className="mt-6 space-y-3">
            <Skeleton className="h-5 w-5/6 rounded-md" />
            <Skeleton className="h-5 w-4/5 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

const ComparePriceSection = ({ product, open }: ComparePriceSectionProps) => {
  const t = useTranslations();
  const [showContent, setShowContent] = useState(false);
  const [openPriceComparision, setOpenPriceComparsion] = useState(
    typeof open === "boolean" ? open : false,
  );

  const hasMarketplace = product.marketplace_products.length > 0;

  useEffect(() => {
    if (typeof open === "boolean") {
      setOpenPriceComparsion(open);
    }
  }, [open]);

  // 🔹 Delay render 1.5s
  useEffect(() => {
    if (!openPriceComparision) {
      setShowContent(false); // reset khi đóng
      return;
    }

    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [openPriceComparision]);

  // 🔹 Lấy giá thấp nhất từ marketplace
  const minMarketplacePrice = hasMarketplace
    ? Math.min(
        ...product.marketplace_products
          .map((item) => item.final_price)
          .filter((price): price is number => typeof price === "number"),
      )
    : null;

  // 🔹 Check product có rẻ nhất không
  const isProductCheapest =
    hasMarketplace &&
    typeof product.final_price === "number" &&
    minMarketplacePrice !== null &&
    product.final_price <= minMarketplacePrice;

  return (
    <section className="mt-12 rounded-2xl border border-[#e7eaef] bg-gradient-to-b from-white to-[#f9fbfa] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] md:p-6">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={openPriceComparision ? "compare" : ""}
        onValueChange={(value) => setOpenPriceComparsion(value === "compare")}
      >
        <AccordionItem value="compare" className="border-b-0">
          <div className="flex justify-end">
            <AccordionTrigger
              className="!flex-none w-fit rounded-xl border border-secondary bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 data-[state=open]:border-secondary data-[state=open]:bg-secondary md:px-5 md:text-base"
              hasIcon
              iconClassName="size-4 text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Scale className="size-4 text-white" />
                {t("priceComparison")}
              </span>
            </AccordionTrigger>
          </div>
          <AccordionContent className="mt-4 md:mt-5">
            {openPriceComparision &&
              (!showContent ? <ComparePriceCardsSkeleton length={4} /> : (
                <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:gap-8">
                  {/* Marketplace prices */}
                  {hasMarketplace &&
                    product.marketplace_products.map((item) => (
                      <ComparePriceCard
                        key={item.marketplace_offer_id}
                        isMarketplace
                        product={product}
                        marketplacePrice={item.final_price}
                        marketplace={item.marketplace}
                      />
                    ))}

                  {/* Product price */}
                  {hasMarketplace && (
                    <ComparePriceCard
                      product={product}
                      className={isProductCheapest ? "border-secondary" : ""}
                      priceClassName={isProductCheapest ? "text-secondary" : ""}
                      isProductCheapest={isProductCheapest}
                      isProduct
                    />
                  )}
                  <ApplyVoucherDialog />
                </div>
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default ComparePriceSection;
