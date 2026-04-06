"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProductResponse } from "@/types/products";
import { useProductsAlgoliaSearch } from "@/features/products/hook";
import DynamicTMTracker from "@/components/shared/tracking/dynamic-tm-tracker";
import { calculateProductVAT } from "@/lib/caculate-vat";
import {
  getFirstCategoryName,
  getTrackingId,
  toTrackingCsv,
  toTrackingString,
} from "@/components/shared/tracking/tracking-utils";

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

  const searchTrackingPayload = useMemo(() => {
    const items = data.items ?? [];
    const normalizedItems = items
      .map((item) => {
        const productId = getTrackingId(item?.id_provider, item?.id);
        const gross = Number(item?.final_price ?? 0);
        const net = Number(calculateProductVAT(gross, item?.tax).net) || 0;
        return {
          productId,
          productName: toTrackingString(item?.name),
          amount: net.toFixed(2),
          category: getFirstCategoryName(item?.categories),
        };
      })
      .filter((item) => item.productId !== "");

    const productIds = toTrackingCsv(
      normalizedItems.map((item) => item.productId),
    );
    const productNames = toTrackingCsv(
      normalizedItems.map((item) => item.productName),
    );
    const amounts = toTrackingCsv(normalizedItems.map((item) => item.amount));
    const categories = toTrackingCsv(
      normalizedItems.map((item) => item.category),
    );
    const levelValues = toTrackingCsv(normalizedItems.map(() => "product"));

    return {
      type: "search",
      country: "DE",
      productids: productIds,
      productnames: productNames,
      amounts,
      categories,
      levelvalues: levelValues,
      searchstring: toTrackingString(searchText),
    };
  }, [data.items, searchText]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <>
      <DynamicTMTracker
        eventId={`dynamic_search_keyword_${searchText}_page_${page}`}
        payload={searchTrackingPayload}
      />
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
