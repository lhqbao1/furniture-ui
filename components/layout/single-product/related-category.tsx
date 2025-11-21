import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { getCategoryById, getCategoryBySlug } from "@/features/category/api";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React from "react";

interface RelatedCategoryProductsProps {
  categorySlug: string;
}

const RelatedCategoryProducts = ({
  categorySlug,
}: RelatedCategoryProductsProps) => {
  const t = useTranslations();
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: () => getCategoryBySlug(categorySlug),
  });

  if (isLoading) return <ProductGridSkeleton />;
  if (!relatedProducts) return;
  return (
    <div>
      <h3 className="text-center text-secondary text-3xl font-semibold">
        {t("relatedProduct")}
      </h3>
      <ProductsGridLayout data={relatedProducts.products.slice(0, 4)} />
    </div>
  );
};

export default RelatedCategoryProducts;
