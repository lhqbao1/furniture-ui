"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import ProductTableSkeleton from "@/components/shared/table-skeleton";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useGetAllProducts } from "@/features/products/hook";
import {
  searchProductQueryStringAtom,
  showAllProductsAtom,
  sortByStockAtom,
} from "@/store/product";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { getProductColumns } from "@/components/layout/admin/products/products-list/column";

const ProductList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🧠 Đọc page từ URL (mặc định 1)
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useAtom<string>(
    searchProductQueryStringAtom,
  );
  const showAll = searchParams.get("all_products") === "true";

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

  return (
    <div className="space-y-6 pb-12">
      <div className="text-3xl text-secondary font-bold text-center">
        Product List
      </div>
      <TableToolbar
        searchQuery={searchQuery}
        pageSize={pageSize}
        setPageSize={setPageSize}
        addButtonText="Add Product"
        addButtonUrl="/admin/products/add"
        setSearchQuery={setSearchQuery}
        exportData={exportData}
        setPage={setPage}
        type={ToolbarType.product}
      />

      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          data={data ? data.items : []}
          columns={getProductColumns(setSortByStock)}
          page={page}
          pageSize={pageSize}
          setPage={handlePageChange}
          setPageSize={setPageSize}
          totalItems={data?.pagination.total_items ?? 0}
          totalPages={data?.pagination.total_pages ?? 0}
        />
      )}
    </div>
  );
};

export default ProductList;
