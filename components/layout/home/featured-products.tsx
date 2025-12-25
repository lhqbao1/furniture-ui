"use client";

import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { getTotalIncomingStock } from "@/lib/calculate-inventory";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";

interface FeaturedProductsProps {
  products: ProductItem[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const t = useTranslations();
  const isPhone = useMediaQuery({ maxWidth: 767 });
  const [mounted, setMounted] = useState(false);

  console.log(products);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Lọc sản phẩm chỉ 1 lần
  const filteredProducts = useMemo(
    () => products.filter((item) => item.is_active),
    [products],
  );

  console.log(filteredProducts);

  if (!mounted) {
    return (
      <div className="section-padding mt-4 lg:mt-6">
        <h2 className="section-header capitalize">{t("featured_products")}</h2>
        <ProductGridSkeleton />
      </div>
    );
  }

  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header capitalize">{t("featured_products")}</h2>

      <ProductsGridLayout data={filteredProducts.slice(0, isPhone ? 6 : 8)} />
    </div>
  );
};

export default FeaturedProducts;
