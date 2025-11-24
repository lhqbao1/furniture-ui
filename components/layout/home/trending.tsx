"use client";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React from "react";
import { useMediaQuery } from "react-responsive";

interface TrendingProductsProps {
  products: ProductItem[];
}

const TrendingProducts = ({ products }: TrendingProductsProps) => {
  const t = useTranslations();
  const isPhone = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="section-padding">
      {!products ? (
        <ProductGridSkeleton />
      ) : (
        <>
          <ProductsGridLayout
            data={
              isPhone
                ? products.filter((item) => item.is_active === true).slice(0, 6)
                : products
                    .filter((item) => item.is_active === true)
                    .slice(0, 32)
            }
          />
        </>
      )}
    </div>
  );
};

export default TrendingProducts;
