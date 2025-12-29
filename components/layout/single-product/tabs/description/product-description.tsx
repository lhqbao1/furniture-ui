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
    <div className="w-full grid lg:grid-cols-2 grid-cols-1 lg:gap-12 gap-6">
      <div
        className="product-descriptions"
        dangerouslySetInnerHTML={{ __html: description ?? "" }}
      />
      <div className="space-y-6">
        <ProductFAQSection question={question} />
        <QAInput productId={productId} />
      </div>
    </div>
  );
};

export default ProductDescription;
