"use client";

import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { getAllProductsSelect } from "@/features/product-group/api";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useGetProductByTag } from "@/features/products/hook";
import { useIsPhone } from "@/hooks/use-is-phone";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React from "react";

const TrendingProducts = () => {
  const t = useTranslations();
  const isPhone = useIsPhone();

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["all-products"],
    queryFn: () =>
      getAllProductsSelect({
        all_products: false,
        is_customer: true,
      }),
  });

  return (
    <div className="section-padding">
      {isLoading || isError || !products ? (
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
