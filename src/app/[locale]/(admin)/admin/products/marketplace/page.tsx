"use client";

import { productMarketplaceColumns } from "@/components/layout/admin/products/marketplace/columns";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar from "@/components/layout/admin/products/products-list/toolbar";
import AdminBackButton from "@/components/shared/admin-back-button";
import ProductTableSkeleton from "@/components/shared/table-skeleton";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useGetAllProducts } from "@/features/products/hook";
import { useRouter } from "@/src/i18n/navigation";
import {
  searchProductQueryStringAtom,
  showAllProductsAtom,
  sortByStockAtom,
} from "@/store/product";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const ProductMarketplace = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🧠 Đọc page từ URL (mặc định 1)
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useAtom<string>(
    searchProductQueryStringAtom
  );
  const [showAll, setShowAll] = useAtom(showAllProductsAtom);
  const [sortByStock, setSortByStock] = useAtom(sortByStockAtom);

  // ⚡ Cập nhật URL mỗi khi page thay đổi
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // 🧩 Khi user back lại (hoặc reload), đọc page từ URL
  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    setPage(urlPage);
  }, [searchParams]);

  const { data, isLoading, isError } = useGetAllProducts({
    page,
    page_size: pageSize,
    all_products: showAll,
    search: searchQuery,
    sort_by_stock: sortByStock,
  });
  const { data: exportData } = useGetProductsSelect();

  if (isError) return <div>No data</div>;
  // if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
  const columns = productMarketplaceColumns(data?.items ?? [], setSortByStock);

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <div className="space-y-12 pb-12">
        {/* <ProductStatistic statistic={statisticDemo} /> */}
        <div className="text-3xl text-secondary font-bold text-center">
          Product Marketplace
        </div>
        <TableToolbar
          showAll={showAll}
          setShowAll={setShowAll}
          searchQuery={searchQuery}
          pageSize={pageSize}
          setPageSize={setPageSize}
          addButtonText="Add Product"
          addButtonUrl="/admin/products/add"
          setSearchQuery={setSearchQuery}
          exportData={exportData}
          setPage={setPage}
        />
        {isLoading ? (
          <ProductTableSkeleton />
        ) : (
          <ProductTable
            data={data?.items ?? []}
            columns={columns}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            totalItems={data?.pagination.total_items ?? 0}
            totalPages={data?.pagination.total_pages ?? 0}
          />
        )}
      </div>
    </div>
  );
};

export default ProductMarketplace;
