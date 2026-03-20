"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProductResponse } from "@/types/products";
import { useProductsAlgoliaSearch } from "@/features/products/hook";

interface ShopKeywordClientProps {
  initialData: ProductResponse;
  searchText: string;
  initialPage: number;
}

export default function ShopKeywordClient({
  initialData,
  searchText,
  initialPage,
}: ShopKeywordClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page"));
  const page = Number.isFinite(pageFromUrl) && pageFromUrl > 0
    ? Math.floor(pageFromUrl)
    : initialPage;

  const { data: queryData } = useProductsAlgoliaSearch({
    query: searchText,
    page,
    page_size: 12,
    is_active: true,
  });

  const data = useMemo(() => {
    const source = queryData ?? initialData;
    const items = Array.isArray(source?.items) ? source.items : [];
    const totalPages = Math.max(
      1,
      Number(source?.pagination?.total_pages) || 1,
    );

    return {
      items,
      pagination: {
        ...source?.pagination,
        total_pages: totalPages,
      },
    };
  }, [initialData, queryData]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="lg:pt-10 md:pt-3 pt-0 pb-12">
        <ProductsGridLayout hasBadge data={data.items} />
      </div>

      {(data.pagination?.total_pages ?? 0) > 1 && (
        <CustomPagination
          totalPages={data.pagination.total_pages ?? 1}
          page={page}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
