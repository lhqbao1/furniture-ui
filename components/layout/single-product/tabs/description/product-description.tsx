import React from "react";
import QAInput from "../q&a/q&a-input";
import { ListFAQQuestion } from "@/components/layout/faq/list-question";
import { ProductFAQSection } from "./faq-accordion";
import { ProductFAQ } from "@/types/products";

interface ProductDescriptionProps {
  description: string;
  productId: string;
  question: ProductFAQ[];
}

const ProductDescription = ({
  description,
  productId,
  question,
}: ProductDescriptionProps) => {
  return (
    <div className="w-full grid grid-cols-12 gap-8">
      <div
        className="product-descriptions font-sans col-span-12 xl:col-span-7"
        dangerouslySetInnerHTML={{ __html: description ?? "" }}
      />
      <div className="xl:col-span-5 col-span-12">
        <ProductFAQSection question={question} />
      </div>
    </div>
  );
};

export default ProductDescription;
