"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductItem } from "@/types/products";
import ComparePriceCard from "./compare-price-card";
import { useTranslations } from "next-intl";

interface ComparePriceSectionProps {
  product: ProductItem;
}

const ComparePriceSection = ({ product }: ComparePriceSectionProps) => {
  const t = useTranslations();

  const hasMarketplace = product.marketplace_products.length > 0;

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
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="md:text-xl text-sm font-medium md:font-bold md:text-gray-600 text-black">
            {t("price_compare")}
          </AccordionTrigger>

          <AccordionContent className="grid xl:grid-cols-4 grid-cols-2 gap-8 overflow-visible mt-12">
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
                isProduct={true}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default ComparePriceSection;
