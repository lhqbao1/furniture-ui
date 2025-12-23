"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import {
  useGetAllProducts,
  useProductsAlgoliaSearch,
} from "@/features/products/hook";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { removeSearchHistoryAtom, searchHistoryAtom } from "@/store/search";
import ShopAllFilterSection from "@/components/layout/shop-all/shop-all-filter-section";

export default function ShopAllPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const history = useAtomValue(searchHistoryAtom);
  const removeHistory = useSetAtom(removeSearchHistoryAtom);

  // 🔹 1. LẤY PARAMS TỪ URL
  const query = searchParams.get("search") ?? undefined;
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const pageSizeFromUrl = Number(searchParams.get("page_size")) || 40;

  const brands = searchParams.getAll("brand");
  const brandsKey =
    brands.length > 0 ? brands.slice().sort().join("|") : undefined;

  const categories = searchParams.getAll("categories");
  const categoriesKey =
    categories.length > 0 ? categories.slice().sort().join("|") : undefined;

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

  // 🔹 4. QUERY
  const { data, isLoading, isError } = useProductsAlgoliaSearch({
    page,
    page_size: pageSize,
    query,
    is_econelo: false,
    brand: brands,
    categories, // 👈 gửi array cho API
    categoriesKey, // 👈 chỉ dùng cho cache
    brandsKey,
    color: colors,
    colorsKey,
    materials: materials,
    materialsKey,
    delivery_time: deliveryTime,
    delivery_timeKey: deliveryTimeKey,
  });

  // 🔹 5. UPDATE URL khi đổi page
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`, { scroll: false });

    // ✅ scroll smooth lên đầu
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isError) {
    return <div className="text-center py-10">Something went wrong</div>;
  }

  return (
    <div className="pt-3 xl:pb-16 pb-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-2 md:block md:col-span-4 lg:col-span-3 xl:col-span-2 hidden">
          <ShopAllFilterSection />
        </div>

        <div className="pt-0 pb-12  col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-10">
          {isLoading || !data ? (
            <ProductGridSkeleton length={12} />
          ) : (
            <>
              <div className="space-y-4 hidden md:block">
                <div className="text-lg">
                  {data.pagination.total_items} {t("items")}
                </div>
              </div>

              <ProductsGridLayout
                hasBadge
                data={data.items}
                isSmall
              />
              {data.pagination.total_pages > 1 && (
                <CustomPagination
                  totalPages={data.pagination.total_pages}
                  page={page}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
