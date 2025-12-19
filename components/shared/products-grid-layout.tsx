"use client";
import React from "react";
import { ProductItem } from "@/types/products";
import ProductCard from "./product-grid-card";

interface ProductsGridLayoutProps {
  hasBadge?: boolean;
  hasPagination?: boolean;
  data: ProductItem[];
}

const ProductsGridLayout = ({
  hasBadge,
  hasPagination = false,
  data,
}: ProductsGridLayoutProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-0 sm:mt-6 mt-4">
      {data
        // .filter((p) => p.stock > 0)
        .map((product, idx) => {
          return (
            <ProductCard
              idx={idx}
              product={product}
              key={product.id}
            />
          );
        })}
    </div>
  );
};

export default ProductsGridLayout;
