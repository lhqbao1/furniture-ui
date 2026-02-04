"use client";

import { POColumns } from "@/components/layout/admin/incoming-inventory/po-columns";
import InventoryTableToolbar from "@/components/layout/admin/inventory/inventory-table-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetAllPurchaseOrders } from "@/features/incoming-inventory/po/hook";
import { useProductInventoryFilters } from "@/hooks/admin/inventory/useInventoryFilter";
import { useRouter } from "@/src/i18n/navigation";
import { sortByStockAtom } from "@/store/product";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const IncomingInventoryList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const searchParams = useSearchParams();
  const router = useRouter();

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

  const { data, isLoading, isError } = useGetAllPurchaseOrders();

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
        Purchase Orders
      </div>

      <InventoryTableToolbar
        pageSize={pageSize}
        setPageSize={setPageSize}
        addButtonText="Add Product"
        addButtonUrl="/admin/products/add"
        setPage={setPage}
      />

      {/* <InventoryTimeLine /> */}

      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          data={data ?? []}
          // columns={getIncomingInventoryColumns(setSortByStock)}
          columns={POColumns}
          page={page}
          pageSize={pageSize}
          setPage={handlePageChange}
          setPageSize={setPageSize}
          totalItems={data?.length ?? 0}
          totalPages={
            data && data.length > 0 && data.length > pageSize
              ? data.length / pageSize
              : 1
          }
          hasHeaderBackGround
        />
      )}
    </div>
  );
};

export default IncomingInventoryList;
