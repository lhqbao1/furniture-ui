"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useProductsAlgoliaSearch } from "@/features/products/hook";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ShopAllFilterSection from "@/components/layout/shop-all/shop-all-filter-section";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import MobileFilter from "@/components/layout/shop-all/mobile-filter";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DynamicTMTracker from "@/components/shared/tracking/dynamic-tm-tracker";
import { calculateProductVAT } from "@/lib/caculate-vat";
import {
  getFirstCategoryName,
  getTrackingId,
  toTrackingCsv,
  toTrackingString,
} from "@/components/shared/tracking/tracking-utils";

const SHOP_ALL_PAGE_SIZE = 20;

export default function ShopAllPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔹 1. LẤY PARAMS TỪ URL
  const query = searchParams.get("search") ?? undefined;
  const pageFromUrl = Number(searchParams.get("page")) || 1;

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

  // 🔹 3. SYNC khi back / reload
  useEffect(() => {
    setPage(pageFromUrl);
  }, [pageFromUrl]);

  // 🔹 4. QUERY
  const { data, isLoading, isFetching, isError } = useProductsAlgoliaSearch({
    page,
    page_size: SHOP_ALL_PAGE_SIZE,
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
    params.delete("page_size");

    router.push(`/shop-all?${params.toString()}`, { scroll: false });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showSkeleton =
    isLoading || !data || (isFetching && (data?.items?.length ?? 0) === 0);

  const normalizedSearch = (query ?? "").trim();
  const searchTrackingPayload = React.useMemo(() => {
    const items = Array.isArray(data?.items) ? data.items : [];
    const normalizedItems = items.map((item) => {
      const productId = getTrackingId(item?.id_provider, item?.id);
      const categoryName = getFirstCategoryName(item?.categories);
      const gross = Number(item?.final_price ?? 0);
      const net = Number(calculateProductVAT(gross, item?.tax).net) || 0;

      return {
        productId,
        productName: toTrackingString(item?.name),
        amount: net.toFixed(2),
        category: categoryName,
      };
    });

    const validItems = normalizedItems.filter((item) => item.productId !== "");

    const productIds = toTrackingCsv(validItems.map((item) => item.productId));
    const productNames = toTrackingCsv(
      validItems.map((item) => item.productName),
    );
    const amounts = toTrackingCsv(validItems.map((item) => item.amount));
    const categoriesValue = toTrackingCsv(
      validItems.map((item) => item.category),
    );
    const levelValues = toTrackingCsv(validItems.map(() => "product"));

    return {
      type: "search",
      country: "DE",
      productids: productIds,
      productnames: productNames,
      amounts,
      categories: categoriesValue,
      levelvalues: levelValues,
      searchstring: toTrackingString(normalizedSearch),
    };
  }, [data?.items, normalizedSearch]);

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
    params.delete("page_size");

    router.push(`/shop-all?${params.toString()}`, { scroll: false });
  };

  const handleClearAllFilters = () => {
    router.push("/shop-all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-3 xl:pb-16 pb-6 relative">
      {normalizedSearch ? (
        <DynamicTMTracker
          enabled={!showSkeleton}
          eventId={`dynamic_search_shop_all_${normalizedSearch}_page_${page}`}
          payload={searchTrackingPayload}
        />
      ) : null}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-2 md:block md:col-span-4 lg:col-span-3 xl:col-span-2 hidden">
          <div className="sticky top-48 max-h-[calc(100vh-6rem)] pr-2 overflow-y-auto no-scrollbar">
            <ShopAllFilterSection isShopAll />
          </div>
        </div>

        <div className="pt-0 pb-12 lg:w-[90%] md:w-[95%] xl:w-[90%] w-full mx-auto col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-10">
          {showSkeleton ? (
            <ProductGridSkeleton length={12} />
          ) : (
            <>
              <div className="space-y-4 flex justify-between items-center">
                <div className="text-lg">
                  {data.pagination.total_items > 0
                    ? `${data.pagination.total_items} ${t("items")}`
                    : ""}
                </div>
                <div className="md:hidden block">
                  <MobileFilter />
                </div>
              </div>

              <h1 className="text-4xl text-secondary font-bold mb-8 text-center">
                {t("shopAll")}
              </h1>

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

              {data.items.length === 0 ? (
                <div className="mt-6 min-h-[52vh] flex items-center justify-center rounded-2xl border border-[#E6EAF0] bg-gradient-to-b from-white to-[#F8FAFC] px-6 py-12">
                  <div className="max-w-lg text-center">
                    <div className="mx-auto mb-6 flex size-28 items-center justify-center rounded-full bg-[#EEF5FF] shadow-sm">
                      <Image
                        src="/illustrations/no-products.svg"
                        alt={t("noProducts")}
                        width={84}
                        height={84}
                        unoptimized
                        className="h-20 w-20 object-contain"
                      />
                    </div>

                    <h2 className="text-2xl font-semibold text-[#111827]">
                      {t("noProducts")}
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-[#4B5563]">
                      {t("noProductsDescription")}
                    </p>

                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={handleClearAllFilters}
                        className="h-11 rounded-full px-6 text-base"
                      >
                        {t("resetFilters")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <ProductsGridLayout hasBadge data={data.items} />
              )}
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
