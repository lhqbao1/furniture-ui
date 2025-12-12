"use client";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { getProductByTag } from "@/features/products/api";
import { useGetAllProducts } from "@/features/products/hook";
import { ProductItem } from "@/types/products";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React from "react";

interface RecentViewedProps {
  products: ProductItem[];
}

const RecentViewed = ({ products }: RecentViewedProps) => {
  const t = useTranslations();

  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header">{t("trending")}</h2>
      <ProductsGridLayout
        data={products.filter((p) => p.stock > 0).slice(0, 8)}
      />
    </div>
  );
};

export default RecentViewed;
