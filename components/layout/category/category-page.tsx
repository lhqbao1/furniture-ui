"use client";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import React, { useEffect, useState } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useTranslations } from "next-intl";
import { CategoryBySlugResponse } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
import {
  getCategoryBySlug,
  getChildrenCategoryByParent,
} from "@/features/category/api";
import ShopAllFilterSection from "../shop-all/shop-all-filter-section";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { useProductsAlgoliaSearch } from "@/features/products/hook";
import { useGetChildrenCategoriesByParent } from "@/features/category/hook";

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
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔹 1. LẤY PARAMS TỪ URL
  const query = searchParams.get("search") ?? undefined;
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const pageSizeFromUrl = Number(searchParams.get("page_size")) || 40;

  const brands = searchParams.getAll("brand");
  const brandsKey =
    brands.length > 0 ? brands.slice().sort().join("|") : undefined;

  const categoriesParams = searchParams.getAll("categories");
  const categoriesKey =
    categoriesParams.length > 0
      ? categoriesParams.slice().sort().join("|")
      : undefined;

  console.log(categoriesParams);

  const colors = searchParams.getAll("color");
  const colorsKey =
    colors.length > 0 ? colors.slice().sort().join("|") : undefined;

  const materials = searchParams.getAll("materials");
  const materialsKey =
    materials.length > 0 ? materials.slice().sort().join("|") : undefined;

  const deliveryTime = searchParams.getAll("delivery_time");
  const deliveryTimeKey =
    deliveryTime.length > 0 ? deliveryTime.slice().sort().join("|") : undefined;

  // 🔹 2. STATE (sync với URL)
  const [page, setPage] = useState(pageFromUrl);
  const [pageSize, setPageSize] = useState(pageSizeFromUrl);

  // 🔹 3. SYNC khi back / reload
  useEffect(() => {
    setPage(pageFromUrl);
    setPageSize(pageSizeFromUrl);
  }, [pageFromUrl, pageSizeFromUrl]);

  const {
    data: listCategory,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = useQuery({
    queryKey: ["category-children", categorySlugs],
    queryFn: () =>
      getChildrenCategoryByParent(categorySlugs[categorySlugs.length - 1]),

    // ✅ giữ data cũ khi refetch
    placeholderData: (prev) => prev,

    // ❌ tắt refetch khi focus
    refetchOnWindowFocus: false,
  });

  const { data: algoliaData, isFetching: isAlgoliaLoading } =
    useProductsAlgoliaSearch({
      page,
      page_size: pageSize,
      is_active: true,
      is_econelo: false,
      query,
      brand: brands,
      brandsKey,
      color: colors,
      colorsKey,
      materials,
      materialsKey,
      delivery_time: deliveryTime,
      delivery_timeKey: deliveryTimeKey,
      categories:
        categoriesParams && categoriesParams.length > 0
          ? categoriesParams
          : listCategory?.child && listCategory?.child?.length > 0
          ? listCategory.child
          : [listCategory?.name ?? ""],
      categoriesKey: categoriesKey,
    });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/shop-all?${params.toString()}`, { scroll: false });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-3 xl:pb-16 pb-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-2 md:block md:col-span-4 lg:col-span-3 xl:col-span-2 hidden">
          <div className="sticky top-48 max-h-[calc(100vh-6rem)] pr-2 overflow-y-auto no-scrollbar">
            <ShopAllFilterSection
              isShopAll={false}
              isParentCategory={
                listCategory && listCategory.child.length > 0 ? true : false
              }
            />
          </div>
        </div>
        <div className="pt-0 pb-12 lg:w-[90%] md:w-[95%] xl:w-[90%] w-full mx-auto col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-10">
          <CustomBreadCrumb currentPage={category?.name ?? ""} />
          <h2 className="section-header">{category?.name}</h2>
          {category?.products.length === 0 ? (
            <p className="text-center text-xl font-bold mt-2">
              {t("emptyCategory")}
            </p>
          ) : (
            ""
          )}

          {!listCategory &&
          !algoliaData &&
          isLoadingList &&
          isAlgoliaLoading ? (
            <ProductGridSkeleton length={12} />
          ) : (
            <div className="filter-section">
              <div className="pt-2 md:pt-6 lg:pt-10 pb-12">
                {isAlgoliaLoading ? (
                  <ProductGridSkeleton length={12} />
                ) : !algoliaData ? (
                  <div>{t("noProducts")}</div>
                ) : (
                  <ProductsGridLayout
                    hasBadge
                    data={algoliaData?.items ?? []}
                  />
                )}
              </div>
            </div>
          )}
          {algoliaData && algoliaData.pagination.total_items > 16 && (
            <CustomPagination
              totalPages={algoliaData.pagination.total_pages}
              page={page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCategory;
