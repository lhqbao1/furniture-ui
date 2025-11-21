import React from "react";
import QAInput from "../q&a/q&a-input";

interface ProductDescriptionProps {
  description: string;
  productId: string;
}

const ProductDescription = ({
  description,
  productId,
}: ProductDescriptionProps) => {
  return (
    <div className="w-full grid lg:grid-cols-2 grid-cols-1 lg:gap-12 gap-6">
      <div
        className="product-descriptions"
        dangerouslySetInnerHTML={{ __html: description ?? "" }}
      />
      <QAInput productId={productId} />
    </div>
  );
};

export default ProductDescription;
