"use client";

import { getInventoryColumns } from "@/components/layout/admin/inventory/columns";
import PhysicalInventoryFilterForm from "@/components/layout/admin/inventory/physical-filter-form";
import PhysicalInventorySearch from "@/components/layout/admin/inventory/physical-inventory-search";
import InventoryTableToolbar from "@/components/layout/admin/inventory/inventory-table-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetAllProducts,
  useGetAllRevenueInventory,
} from "@/features/products/hook";
import { useProductInventoryFilters } from "@/hooks/admin/inventory/useInventoryFilter";
import { useRouter } from "@/src/i18n/navigation";
import { sortByStockAtom } from "@/store/product";
import { ProductItem } from "@/types/products";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const formatCurrency = (value?: number) =>
  Number(value ?? 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const renderCurrencyValue = (value?: number) =>
  value === undefined ? "—" : `€${formatCurrency(value)}`;

const AdminInventoryList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeTab, setActiveTab] = useState("inventory");
  const [, setSortByStock] = useAtom(sortByStockAtom);

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

  const multiSearchRaw = searchParams.get("multi_search") ?? "";
  const multiSearchValues = useMemo(
    () =>
      multiSearchRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [multiSearchRaw],
  );

  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    isFetching: isInventoryFetching,
    isError: isInventoryError,
  } = useGetAllProducts({
    page,
    page_size: pageSize,
    all_products: filters.all_products,
    search: filters.search,
    is_inventory: "false",
    supplier_id: filters.supplier_id,
    brand_id: filters.brand,
  });
  const {
    data: physicalInventoryData,
    isLoading: isPhysicalInventoryLoading,
    isFetching: isPhysicalInventoryFetching,
    isError: isPhysicalInventoryError,
  } = useGetAllRevenueInventory({
    page,
    page_size: pageSize,
    search:
      multiSearchValues.length > 0 ? multiSearchValues : filters.search || undefined,
    is_econelo: filters.is_econelo,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);
  const physicalInventoryItems = (physicalInventoryData?.items ??
    []) as ProductItem[];
  const isInventoryPending = isInventoryLoading || isInventoryFetching;
  const isPhysicalInventoryPending =
    isPhysicalInventoryLoading || isPhysicalInventoryFetching;

  return (
    <div className="space-y-6 pb-12">
      <div className="text-3xl text-secondary font-bold text-center">
        Inventory
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="physical-inventory">
            Physical Inventory
          </TabsTrigger>
        </TabsList>

        <InventoryTableToolbar
          pageSize={pageSize}
          setPageSize={setPageSize}
          addButtonText="Add Product"
          addButtonUrl="/admin/products/add"
          setPage={setPage}
          isInventory
          filterContent={
            activeTab === "physical-inventory" ? (
              <PhysicalInventoryFilterForm />
            ) : undefined
          }
          searchContent={
            activeTab === "physical-inventory" ? (
              <PhysicalInventorySearch />
            ) : undefined
          }
        />

        <TabsContent value="inventory">
          {isInventoryError ? (
            <div>No data</div>
          ) : isInventoryPending ? (
            <ProductTableSkeleton />
          ) : (
            <ProductTable
              data={inventoryData?.items ?? []}
              columns={getInventoryColumns(setSortByStock)}
              page={page}
              pageSize={pageSize}
              setPage={handlePageChange}
              setPageSize={setPageSize}
              totalItems={inventoryData?.pagination.total_items ?? 0}
              totalPages={inventoryData?.pagination.total_pages ?? 0}
              hasHeaderBackGround
            />
          )}
        </TabsContent>

        <TabsContent value="physical-inventory" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-secondary/15 bg-white p-5 shadow-sm">
              {isPhysicalInventoryPending ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-40" />
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-muted-foreground">
                    Inventory Value
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">
                    {renderCurrencyValue(physicalInventoryData?.inventory_value)}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-secondary/15 bg-white p-5 shadow-sm">
              {isPhysicalInventoryPending ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-muted-foreground">
                    Final Price Value
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">
                    {renderCurrencyValue(physicalInventoryData?.final_price_value)}
                  </div>
                </>
              )}
            </div>
          </div>

          {isPhysicalInventoryError ? (
            <div>No data</div>
          ) : isPhysicalInventoryPending ? (
            <ProductTableSkeleton />
          ) : (
            <ProductTable
              data={physicalInventoryItems}
              columns={getInventoryColumns(setSortByStock)}
              page={page}
              pageSize={pageSize}
              setPage={handlePageChange}
              setPageSize={setPageSize}
              totalItems={physicalInventoryData?.pagination.total_items ?? 0}
              totalPages={physicalInventoryData?.pagination.total_pages ?? 0}
              hasHeaderBackGround
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventoryList;
