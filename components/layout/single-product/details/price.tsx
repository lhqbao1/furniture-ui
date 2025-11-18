import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React from "react";

interface ProductDetailsPriceProps {
  productDetails: ProductItem;
}

const ProductDetailsPrice = ({ productDetails }: ProductDetailsPriceProps) => {
  console.log(productDetails);
  const t = useTranslations();
  return (
    <div className="space-y-2">
      <div className="inline-flex items-end justify-start w-fit gap-6 font-bold text-gray-900 relative">
        <div className="text-4xl">
          {Math.floor(
            productDetails.final_price
              ? productDetails.final_price
              : productDetails.price,
          )}
        </div>
        <div className="text-base font-bold text-gray-700 absolute top-0 right-2.5">
          ,
          {
            (
              (productDetails.final_price
                ? productDetails.final_price
                : productDetails.price) % 1
            )
              .toFixed(2)
              .split(".")[1]
          }
        </div>
        <div className="text-base font-semibold text-black">€</div>
      </div>

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
