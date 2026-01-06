"use client";
import React from "react";
import { ProductItem } from "@/types/products";
import ProductCard from "./product-grid-card";

interface ProductsGridLayoutProps {
  hasBadge?: boolean;
  hasPagination?: boolean;
  data: ProductItem[];
  isSmall?: boolean;
  isProductDetails?: boolean;
}

const ProductsGridLayout = ({
  hasBadge,
  hasPagination = false,
  data,
  isSmall,
  isProductDetails,
}: ProductsGridLayoutProps) => {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:mt-6 mt-4 gap-8">
      {data
        // .filter((p) => p.stock > 0)
        .map((product, idx) => {
          return (
            <ProductCard
              idx={idx}
              product={product}
              key={product.id}
              className={isSmall ? "" : ""}
              isProductDetails={isProductDetails}
              isLCP={idx === 0}
            />
          );
        })}
    </div>
  );
};

export default ProductsGridLayout;
