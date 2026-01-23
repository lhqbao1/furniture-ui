"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetAllProducts } from "@/features/products/hook";
import { sortByStockAtom } from "@/store/product";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { getProductColumns } from "@/components/layout/admin/products/products-list/column";
import { useProductListFilters } from "@/hooks/admin/product-list/useProductListFilter";

const DSPriceProductList = () => {
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
    const param = searchParams.get("page");
    if (param !== null) {
      setPage(Number(param));
    }
  }, [searchParams]);

  const { data, isLoading, isError } = useGetAllProducts({
    page,
    page_size: pageSize,
    all_products: filters.all_products,
    search: filters.search,
    sort_by_stock: filters.sort_by_stock,
    supplier_id: filters.supplier_id,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

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
        exportData={[]}
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

export default DSPriceProductList;
