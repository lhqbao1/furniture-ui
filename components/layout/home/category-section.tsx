import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { getCategoryBySlug } from "@/features/category/api";
import React from "react";

interface CategorySectionProps {
  slug: string;
}

const CategorySection = async ({ slug }: CategorySectionProps) => {
  const products = await getCategoryBySlug(slug).catch((err) => {
    return null;
  });

  if (!products) return <ProductGridSkeleton length={4} />;
  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header">{products.name}</h2>
      <ProductsGridLayout
        data={products.products.filter((item) => item.is_active).slice(0, 4)}
      />
    </div>
  );
};

export default CategorySection;
