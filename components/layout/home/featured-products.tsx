"use client";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React from "react";
import { useMediaQuery } from "react-responsive";

interface FeaturedProductsProps {
  products: ProductItem[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const t = useTranslations();
  const isPhone = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="section-padding mt-4 lg:mt-40">
      <h2 className="section-header capitalize">{t("featured_products")}</h2>
      {!products ? (
        <ProductGridSkeleton />
      ) : (
        <>
          <ProductsGridLayout
            data={
              isPhone
                ? products.filter((item) => item.is_active === true).slice(0, 6)
                : products.filter((item) => item.is_active === true).slice(0, 8)
            }
          />
        </>
      )}
    </div>
  );
};

export default FeaturedProducts;
