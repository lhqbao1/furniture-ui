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
  queryKey: readonly [string];
}

const RecentViewed = ({ queryKey }: RecentViewedProps) => {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<ProductItem[]>({
    queryKey,
    queryFn: () => getProductByTag("Trending").catch(() => []),
    staleTime: 60000, // 1 phút
    retry: 1, // ⭐ không retry 3 lần
    initialData: () => queryClient.getQueryData(queryKey),
  });

  if (isLoading) return <ProductGridSkeleton />;
  if (error || !products)
    return <div>Error loading recent viewed products</div>;

  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header">{t("trending")}</h2>
      {/* {!products ? (
        <ProductGridSkeleton />
      ) : (
        <ProductsGridLayout
          data={products.filter((p) => p.stock > 0).slice(0, 8)}
        />
      )} */}
      <ProductsGridLayout
        data={products.filter((p) => p.stock > 0).slice(0, 8)}
      />
    </div>
  );
};

export default RecentViewed;
