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
import { useAtom } from "jotai";
import { openPriceComparisionAtom } from "@/store/price-comparision";

interface ComparePriceSectionProps {
  product: ProductItem;
  open?: boolean; // 👈 control từ ngoài
}

const ComparePriceSection = ({ product, open }: ComparePriceSectionProps) => {
  const t = useTranslations();
  const [showContent, setShowContent] = useState(false);
  const [openPriceComparision, setOpenPriceComparsion] = useAtom(
    openPriceComparisionAtom,
  );

  const hasMarketplace = product.marketplace_products.length > 0;

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
    <section className="mt-12">
      <Accordion
        type="single"
        collapsible={false}
        className="w-full"
        value={openPriceComparision ? "compare" : undefined}
      >
        <AccordionItem
          value="compare"
          className="border-b-0"
        >
          <AccordionContent className="mt-12">
            {openPriceComparision &&
              (!showContent ? (
                <ProductGridSkeleton
                  length={4}
                  hasLoading
                />
              ) : (
                <div className="grid xl:grid-cols-4 grid-cols-2 gap-y-12 gap-x-4 md:gap-x-8 md:gap-y-8 w-full">
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
                </div>
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default ComparePriceSection;
