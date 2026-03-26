"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductItem } from "@/types/products";
import ComparePriceCard from "./compare-price-card";
import { useTranslations } from "next-intl";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { ApplyVoucherDialog } from "./apply-voucher-dialog";

interface ComparePriceSectionProps {
  product: ProductItem;
  open?: boolean; // 👈 control từ ngoài
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
          <AccordionTrigger
            className="rounded-xl border border-[#dfe4ea] bg-white px-4 py-3 text-lg font-semibold text-[#2b3543] transition-colors hover:bg-[#f8fafc] data-[state=open]:border-[#c8ead8] data-[state=open]:bg-[#f3fbf7] md:px-5 md:py-4 md:text-2xl"
            hasIcon
            iconClassName="size-5 text-[#5d6b7b]"
          >
            {t("priceComparison")}
          </AccordionTrigger>
          <AccordionContent className="mt-4 md:mt-5">
            {openPriceComparision &&
              (!showContent ? (
                <ProductGridSkeleton length={4} hasLoading />
              ) : (
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:gap-8">
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
