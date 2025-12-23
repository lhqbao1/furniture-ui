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
            {product.marketplace_products.length > 0
              ? product.marketplace_products.map((item, index) => {
                  return (
                    <ComparePriceCard
                      isMarketplace
                      product={product}
                      marketplacePrice={item.final_price}
                      marketplace={item.marketplace}
                      key={item.marketplace_offer_id}
                    />
                  );
                })
              : ""}

            {product.marketplace_products.length > 0 && (
              <ComparePriceCard product={product} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default ComparePriceSection;
