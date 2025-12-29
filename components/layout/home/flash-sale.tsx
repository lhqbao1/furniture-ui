"use client";
import CountDownGridLayout from "@/components/shared/count-down-grid-layout";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { useGetProductByTag } from "@/features/products/hook";
import { useIsPhone } from "@/hooks/use-is-phone";
import { useTranslations } from "next-intl";
import React from "react";

const FlashSale = () => {
  const t = useTranslations();
  const isPhone = useIsPhone();
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductByTag("Trending", {
    is_econelo: false,
  });

  return (
    <div className="section-padding">
      <h2 className="text-secondary text-5xl font-bold text-center capitalize mb-2">
        {t("flashSale")}
      </h2>
      <p className="text-primary text-lg text-center uppercase">
        {t("upTo")} 50%
      </p>
      {isLoading || isError || !products ? (
        <ProductGridSkeleton />
      ) : (
        <>
          <CountDownGridLayout
            products={isPhone ? products.slice(0, 6) : products.slice(0, 8)}
          />
        </>
      )}
    </div>
  );
};

export default FlashSale;
