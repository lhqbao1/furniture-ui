import ProductPricingField from "@/components/shared/product-pricing-field";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React from "react";

interface ProductDetailsPriceProps {
  productDetails: ProductItem;
  isProductDetails?: boolean;
}

const ProductDetailsPrice = ({
  productDetails,
  isProductDetails,
}: ProductDetailsPriceProps) => {
  const t = useTranslations();
  return (
    <div className="space-y-2">
      <ProductPricingField
        product={productDetails}
        isProductDetails={isProductDetails}
      />
    </div>
  );
};

export default ProductDetailsPrice;
