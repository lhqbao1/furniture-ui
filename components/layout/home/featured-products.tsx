"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

interface FeaturedProductsProps {
  products: ProductItem[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const t = useTranslations();

  // ✅ Lọc sản phẩm chỉ 1 lần
  const filteredProducts = useMemo(
    () => products.filter((item) => item.is_active),
    [products],
  );

  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header capitalize">{t("featured_products")}</h2>
      <ProductsGridLayout data={filteredProducts.slice(0, 8)} hideAfterSm={6} />
    </div>
  );
};

export default FeaturedProducts;
