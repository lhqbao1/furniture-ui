"use client";
import { getInventoryColumns } from "@/components/layout/admin/inventory/columns";
import InventoryTableToolbar from "@/components/layout/admin/inventory/inventory-table-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetAllProducts } from "@/features/products/hook";
import { useProductInventoryFilters } from "@/hooks/admin/inventory/useInventoryFilter";
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

  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useProductInventoryFilters();

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
    is_inventory: filters.is_inventory,
  });

  if (isError) return <div>No data</div>;

  // const sortedItems = React.useMemo(() => {
  //   if (!data?.items) return [];

  //   return [...data.items].sort((a, b) => {
  //     const aHasInventory =
  //       Array.isArray(a.inventory) && a.inventory.length > 0;
  //     const bHasInventory =
  //       Array.isArray(b.inventory) && b.inventory.length > 0;

  //     // a có inventory, b không → a lên trước
  //     if (aHasInventory && !bHasInventory) return -1;

  //     // b có inventory, a không → b lên trước
  //     if (!aHasInventory && bHasInventory) return 1;

  //     // cả hai giống nhau → giữ nguyên thứ tự
  //     return 0;
  //   });
  // }, [data?.items]);
  return (
    <div className="space-y-6 pb-12">
      <div className="text-3xl text-secondary font-bold text-center">
        Incoming Inventory
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
          data={data?.items ?? []}
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
