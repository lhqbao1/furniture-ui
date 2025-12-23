"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useGetAllProducts } from "@/features/products/hook";
import { searchProductQueryStringAtom, sortByStockAtom } from "@/store/product";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { getProductColumns } from "@/components/layout/admin/products/products-list/column";
import { useProductListFilters } from "@/hooks/admin/product-list/useProductListFilter";

const ProductList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortByStock, setSortByStock] = useAtom(sortByStockAtom);

  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useProductListFilters();

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
    all_products: filters.all_products,
    search: filters.search,
    sort_by_stock: filters.sort_by_stock,
  });

  const { data: exportData } = useGetProductsSelect({
    is_customer: false,
  });

  console.log(exportData);

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="text-3xl text-secondary font-bold text-center">
        Product List
      </div>
      <TableToolbar
        pageSize={pageSize}
        setPageSize={setPageSize}
        addButtonText="Add Product"
        addButtonUrl="/admin/products/add"
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
          hasHeaderBackGround
        />
      )}
    </div>
  );
};

export default ProductList;
