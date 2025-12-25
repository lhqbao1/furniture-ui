"use client";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import React, { useState } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useAtom } from "jotai";
import {
  currentCategoryIdAtom,
  currentCategoryNameAtom,
} from "@/store/category";
import { useTranslations } from "next-intl";
import { CategoryBySlugResponse } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/features/category/api";

interface ProductCategoryProps {
  categorySlugs: string[];
  tag?: string;
  category?: CategoryBySlugResponse;
}

const ProductCategory = ({
  categorySlugs,
  tag,
  category,
}: ProductCategoryProps) => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [currentCategoryName, setCurrentCategoryName] = useAtom(
    currentCategoryNameAtom,
  );
  const { data: categoryData, isFetching } = useQuery({
    queryKey: ["category", categorySlugs, page, pageSize],
    queryFn: () =>
      getCategoryBySlug(categorySlugs[categorySlugs.length - 1], {
        page,
        page_size: pageSize,
      }),

    // ✅ giữ data cũ khi refetch
    placeholderData: (prev) => prev,

    // ❌ tắt refetch khi focus
    refetchOnWindowFocus: false,
  });

  return (
    <div className="pt-3 xl:pb-16 pb-6">
      <CustomBreadCrumb currentPage={category?.name ?? ""} />
      <div className="">
        <h2 className="section-header">{category?.name}</h2>
        {category?.products.length === 0 ? (
          <p className="text-center text-xl font-bold mt-2">
            {t("emptyCategory")}
          </p>
        ) : (
          ""
        )}

        {!categoryData && isFetching ? (
          <ProductGridSkeleton length={12} />
        ) : (
          <div className="filter-section">
            <div className="pt-2 md:pt-6 lg:pt-10 pb-12">
              <ProductsGridLayout
                hasBadge
                data={categoryData?.products ?? []}
              />
            </div>
          </div>
        )}
      </div>
      {categoryData && categoryData.total_items > 16 && (
        <CustomPagination
          totalPages={categoryData.total_pages}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ProductCategory;
