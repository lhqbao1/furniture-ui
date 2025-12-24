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

      {productDetails.price &&
        productDetails.price > productDetails.final_price && (
          <p className="text-base mb-1">
            {!productDetails.owner ||
            productDetails.owner.business_name === "Prestige Home"
              ? t("ogPrice")
              : t("ogPriceSupplier")}
            : €
            {productDetails.price.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
    </div>
  );
};

export default ProductDetailsPrice;
