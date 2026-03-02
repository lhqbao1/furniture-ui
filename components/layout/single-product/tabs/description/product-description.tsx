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
    <div className="w-full lg:w-2/3">
      <div
        className="product-descriptions font-sans"
        dangerouslySetInnerHTML={{ __html: description ?? "" }}
      />
    </div>
  );
};

export default ProductDescription;
