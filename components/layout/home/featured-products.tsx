import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductItem } from "@/types/products";
import { getTranslations } from "next-intl/server";
import React from "react";

interface FeaturedProductsProps {
  products: ProductItem[];
}

const FeaturedProducts = async ({ products }: FeaturedProductsProps) => {
  const t = await getTranslations();

  const filteredProducts = products.filter((item) => item.is_active);

  return (
    <div className="section-padding mt-4 lg:mt-6">
      <h2 className="section-header capitalize">{t("featured_products")}</h2>
      <ProductsGridLayout data={filteredProducts.slice(0, 8)} hideAfterSm={6} />
    </div>
  );
};

export default FeaturedProducts;
