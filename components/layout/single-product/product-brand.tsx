"use client";
import { useRouter } from "@/src/i18n/navigation";
import { ProductItem } from "@/types/products";
import { useLocale } from "next-intl";
import React from "react";

interface ProductBrandProps {
  product: ProductItem;
}

const ProductBrand = ({ product }: ProductBrandProps) => {
  const router = useRouter();
  const locale = useLocale();
  return (
    <p
      className="uppercase text-sm cursor-pointer text-black/50 font-bold hover:text-secondary"
      onClick={() => {
        if (!product.brand?.name) return;

        router.push(
          {
            pathname: "/shop-all",
            query: {
              brand: product.brand.name,
            },
          },
          { locale },
        );
      }}
    >
      {product.brand?.name}
    </p>
  );
};

export default ProductBrand;
