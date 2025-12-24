"use client";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { Button } from "@/components/ui/button";
import { getCategoryById, getCategoryBySlug } from "@/features/category/api";
import { useRouter } from "@/src/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

interface RelatedCategoryProductsProps {
  categorySlug: string;
}

const RelatedCategoryProducts = ({
  categorySlug,
}: RelatedCategoryProductsProps) => {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: () => getCategoryBySlug(categorySlug),
  });

  if (isLoading) return <ProductGridSkeleton />;
  if (!relatedProducts) return;
  return (
    <div className="mt-6 flex flex-col justify-center items-center">
      <h3 className="text-center text-secondary text-3xl font-semibold">
        {t("relatedProduct")}
      </h3>
      <ProductsGridLayout
        data={relatedProducts.products.slice(0, 4)}
        // className="lg:min-h-[52px] min-h-[48px]"
      />
      <Button
        variant={"secondary"}
        onClick={() => router.push(`/category/${categorySlug}`, { locale })}
        className="lg:mt-10 mt-6 px-6 rounded-4xl"
      >
        {t("viewAll")}
      </Button>
    </div>
  );
};

export default RelatedCategoryProducts;
