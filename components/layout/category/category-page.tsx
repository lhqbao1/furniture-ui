"use client";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import React, { useEffect, useState } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useTranslations } from "next-intl";
import { CategoryBySlugResponse } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
import { getChildrenCategoryByParent } from "@/features/category/api";
import ShopAllFilterSection from "../shop-all/shop-all-filter-section";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { useProductsAlgoliaSearch } from "@/features/products/hook";
import { Button } from "@/components/ui/button";
import { ArrowRight, SearchX } from "lucide-react";
import DynamicTMTracker from "@/components/shared/tracking/dynamic-tm-tracker";
import {
  getTrackingId,
  toTrackingCsv,
  toTrackingString,
} from "@/components/shared/tracking/tracking-utils";

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
  const pageSizeFromUrl = Number(searchParams.get("page_size")) || 20;

  const brands = searchParams.getAll("brand");
  const brandsKey =
    brands.length > 0 ? brands.slice().sort().join("|") : undefined;

  const categoriesParams = searchParams.getAll("categories");
  const categoriesKey =
    categoriesParams.length > 0
      ? categoriesParams.slice().sort().join("|")
      : undefined;

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

  const { data: listCategory, isLoading: isLoadingList } = useQuery({
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

  const categorySlug = categorySlugs[categorySlugs.length - 1];
  const isEmptyCategory = Boolean(
    algoliaData && algoliaData.items?.length === 0,
  );

  const categoryTrackingPayload = React.useMemo(() => {
    const items = algoliaData?.items ?? [];
    const productIds = toTrackingCsv(
      items.map((item) => getTrackingId(item?.id_provider, item?.id)),
    );
    const catLevel1 = toTrackingString(categorySlugs?.[0]);
    const catLevel2 = toTrackingString(categorySlugs?.[1]);
    const categoryId = toTrackingString(category?.slug ?? categorySlug);
    const categoryName = toTrackingString(category?.name ?? listCategory?.name);

    return {
      type: "categorypage",
      catlevel1: catLevel1,
      catlevel2: catLevel2,
      country: "DE",
      categoryid: categoryId,
      category: categoryName,
      productids: productIds,
    };
  }, [
    algoliaData?.items,
    category?.name,
    category?.slug,
    categorySlug,
    categorySlugs,
    listCategory?.name,
  ]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/category/${categorySlug}?${params.toString()}`, {
      scroll: false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetCategoryFilters = () => {
    router.push(`/category/${categorySlug}`, { scroll: false });
  };

  return (
    <div className="pt-3 xl:pb-16 pb-6">
      <DynamicTMTracker
        enabled={!isAlgoliaLoading}
        eventId={`dynamic_category_${categorySlug}_page_${page}`}
        payload={categoryTrackingPayload}
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-2 md:block md:col-span-4 lg:col-span-3 xl:col-span-2 hidden">
          <div className="sticky top-48 max-h-[calc(100vh-6rem)] pr-2 overflow-y-auto no-scrollbar">
            <ShopAllFilterSection
              isShopAll={false}
              isParentCategory={
                listCategory && listCategory.child.length > 0 ? true : false
              }
              categorySlug={categorySlug}
            />
          </div>
        </div>
        <div className="pt-0 pb-12 lg:w-[90%] md:w-[95%] xl:w-[90%] w-full mx-auto col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-10">
          <CustomBreadCrumb currentPage={category?.name ?? ""} />
          <h1 className="section-header">{category?.name}</h1>

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
                ) : isEmptyCategory ? (
                  <div className="mx-auto mt-4 w-full max-w-3xl rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 shadow-sm md:p-8">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <SearchX className="size-7" />
                    </div>

                    <h2 className="text-center text-xl font-bold text-slate-900 md:text-2xl">
                      {t("emptyCategoryTitle")}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-600 md:text-base">
                      {t("emptyCategoryDescription")}
                    </p>

                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleResetCategoryFilters}
                      >
                        {t("emptyCategoryResetFilters")}
                      </Button>
                      <Button
                        className="w-full sm:w-auto"
                        onClick={() => router.push("/shop-all")}
                      >
                        {t("emptyCategoryBrowseAll")}
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
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
