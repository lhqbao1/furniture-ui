"use client";
import { getInventoryColumns } from "@/components/layout/admin/inventory/columns";
import InventoryTableToolbar from "@/components/layout/admin/inventory/inventory-table-toolbar";
import { getProductColumns } from "@/components/layout/admin/products/products-list/column";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/table-skeleton";
import { useGetAllProducts } from "@/features/products/hook";
import { useProductListFilters } from "@/hooks/admin/product-list/useProductListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { sortByStockAtom } from "@/store/product";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const AdminInventoryList = () => {
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
    is_inventory: false,
  });

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="text-3xl text-secondary font-bold text-center">
        Inventory
      </div>
      <InventoryTableToolbar
        pageSize={pageSize}
        setPageSize={setPageSize}
        addButtonText="Add Product"
        addButtonUrl="/admin/products/add"
        setPage={setPage}
      />

      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          data={data ? data.items : []}
          columns={getInventoryColumns(setSortByStock)}
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

export default AdminInventoryList;
