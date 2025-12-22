"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useGetAllProducts } from "@/features/products/hook";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { searchHistoryAtom } from "@/store/search";

export default function ShopAllPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const history = useAtomValue(searchHistoryAtom);

  // 🔹 1. LẤY PARAMS TỪ URL
  const search = searchParams.get("search") ?? undefined;
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const pageSizeFromUrl = Number(searchParams.get("page_size")) || 40;

  // 🔹 2. STATE (sync với URL)
  const [page, setPage] = useState(pageFromUrl);
  const [pageSize, setPageSize] = useState(pageSizeFromUrl);

  // 🔹 3. SYNC khi back / reload
  useEffect(() => {
    setPage(pageFromUrl);
    setPageSize(pageSizeFromUrl);
  }, [pageFromUrl, pageSizeFromUrl]);

  // 🔹 4. QUERY
  const { data, isLoading, isError } = useGetAllProducts({
    page,
    page_size: pageSize,
    search,
    is_econelo: false,
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

  if (isLoading || !data) {
    return <ProductGridSkeleton length={12} />;
  }

  if (isError) {
    return <div className="text-center py-10">Something went wrong</div>;
  }

  return (
    <div className="pt-3 xl:pb-16 pb-6">
      <div className="lg:pt-10 md:pt-3 pt-0 pb-12">
        <ProductsGridLayout
          hasBadge
          data={data.items}
        />
      </div>

      {data.pagination.total_pages > 1 && (
        <CustomPagination
          totalPages={data.pagination.total_pages}
          page={page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
