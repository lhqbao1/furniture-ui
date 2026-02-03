"use client";

import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";

interface ShopKeywordClientProps {
  initialData: any;
  searchText: string;
}

export default function ShopKeywordClient({
  initialData,
  searchText,
}: ShopKeywordClientProps) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const searchParams = useSearchParams();

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

      {data.pagination.total_pages > 1 && (
        <CustomPagination
          totalPages={data.pagination.total_pages}
          page={page}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
