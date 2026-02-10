"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useProductsAlgoliaSearch } from "@/features/products/hook";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ShopAllFilterSection from "@/components/layout/shop-all/shop-all-filter-section";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import MobileFilter from "@/components/layout/shop-all/mobile-filter";
import { Loader2, X } from "lucide-react";

export default function ShopAllPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    is_active: true,
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

    router.push(`/shop-all?${params.toString()}`, { scroll: false });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isError) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("search"); // ❌ xóa query
    params.delete("page"); // (optional) reset về page 1

    router.push(`/shop-all?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="pt-3 xl:pb-16 pb-6 relative">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-2 md:block md:col-span-4 lg:col-span-3 xl:col-span-2 hidden">
          <div className="sticky top-48 max-h-[calc(100vh-6rem)] pr-2 overflow-y-auto no-scrollbar">
            <ShopAllFilterSection isShopAll />
          </div>
        </div>

        <div className="pt-0 pb-12 lg:w-[90%] md:w-[95%] xl:w-[90%] w-full mx-auto col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-10">
          {isLoading || !data ? (
            <ProductGridSkeleton length={12} />
          ) : (
            <>
              <div className="space-y-4 flex justify-between items-center">
                <div className="text-lg">
                  {data.pagination.total_items} {t("items")}
                </div>
                <div className="md:hidden block">
                  <MobileFilter />
                </div>
              </div>

              {query && (
                <div className="py-1 px-3 border rounded-full w-fit  gap-1.5 items-center md:hidden flex">
                  <span>{query}</span>
                  <button
                    onClick={handleClearSearch}
                    className="hover:bg-red-100 rounded-full p-0.5 transition"
                    aria-label="Clear search"
                  >
                    <X className="size-4 text-red-500 mt-1" />
                  </button>
                </div>
              )}

              <ProductsGridLayout hasBadge data={data.items} isSmall />
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
