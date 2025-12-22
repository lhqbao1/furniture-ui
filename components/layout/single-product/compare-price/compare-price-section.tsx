import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductItem } from "@/types/products";

interface ComparePriceSectionProps {
  product: ProductItem;
}

const ComparePriceSection = ({ product }: ComparePriceSectionProps) => {
  return (
    <section>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Price comparation</AccordionTrigger>
          <AccordionContent className="grid grid-cols-4 gap-8">
            {product.marketplace_products.length > 0
              ? product.marketplace_products.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-col"
                    >
                      <span>{item.marketplace}</span>
                      <span>{item.final_price}</span>
                    </div>
                  );
                })
              : ""}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default ComparePriceSection;
