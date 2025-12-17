"use client";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

interface RecentViewedProps {
  products: ProductItem[];
}

const RecentViewed = ({ products }: RecentViewedProps) => {
  const t = useTranslations();
  const isPhone = useMediaQuery({ maxWidth: 767 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <ProductGridSkeleton />; // hoặc skeleton

  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header">{t("trending")}</h2>
      <ProductsGridLayout
        data={products
          .filter((item) => item.is_active)
          .slice(0, isPhone ? 6 : 8)}
      />
    </div>
  );
};

export default RecentViewed;
