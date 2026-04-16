"use client";
import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
import OrderExpandTable from "@/components/layout/admin/orders/order-list/expand-delivery";
import OrderToolbar from "@/components/layout/admin/orders/order-list/order-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { ToolbarType } from "@/components/layout/admin/products/products-list/toolbar";
import { useGetCheckOutMain } from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, PackageSearch, RefreshCw } from "lucide-react";
import { CheckOutMain } from "@/types/checkout";
import { Button } from "@/components/ui/button";

const OrderList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedOrders, setSelectedOrders] = useState<CheckOutMain[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useOrderListFilters();

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

  const { data, isLoading, isFetching, isError, refetch } = useGetCheckOutMain({
    page,
    page_size: pageSize,
    status: filters.status, // <-- thêm
    channel: filters.channel, // <-- thêm
    from_date: filters.fromDate,
    to_date: filters.toDate,
    search: filters.search,
    is_b2b: filters.isB2B,
  });

  const multiSearchRaw = searchParams.get("multi_search") ?? "";
  const multiSearchValues = useMemo(
    () =>
      multiSearchRaw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    [multiSearchRaw],
  );

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (multiSearchValues.length === 0) return data.items;

    const target = new Set(multiSearchValues);
    return data.items.filter((item) =>
      target.has((item.marketplace_order_id ?? "").trim().toLowerCase()),
    );
  }, [data?.items, multiSearchValues]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const showEmptyState =
    !isLoading && !isFetching && !isError && filteredItems.length === 0;

  return (
    <div className="relative flex flex-col gap-6 pb-4">
      <div className="space-y-6">
        <div className="text-3xl text-secondary font-bold text-center">
          Order List
        </div>
        <OrderToolbar
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          type={ToolbarType.order}
          selectedOrders={selectedOrders}
        />
        {isError ? (
          <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <div className="max-w-xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Unable to load orders
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The browser may have been idle too long or the network request
                failed. You can try fetching again or reload this page.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary/90"
                  onClick={() => {
                    void refetch();
                  }}
                  disabled={isFetching}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload page
                </Button>
              </div>
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="flex h-[60vh] items-center justify-center rounded-2xl border bg-muted/20 p-6">
            <div className="max-w-xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
                <PackageSearch className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No orders found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No order matches the current search/filter values. You can
                adjust filters or reload data.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary/90"
                  onClick={() => {
                    void refetch();
                  }}
                  disabled={isFetching}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload list
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload page
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ProductTable
            data={filteredItems}
            columns={orderColumns}
            page={page}
            setPage={handlePageChange}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={
              multiSearchValues.length > 0
                ? filteredItems.length
                : (data?.pagination.total_items ?? 0)
            }
            totalPages={
              multiSearchValues.length > 0
                ? 1
                : (data?.pagination.total_pages ?? 0)
            }
            hasBackground
            hasExpanded
            allowMultipleExpandedRows
            renderRowSubComponent={(row) => <OrderExpandTable row={row} />}
            hasHeaderBackGround
            isSticky
            stickyContainerClassName="h-full"
            onSelectedRowsChange={(rows) => setSelectedOrders(rows)}
          />
        )}
      </div>

      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <Loader2 className="size-10 animate-spin text-secondary" />
        </div>
      )}
    </div>
  );
};

export default OrderList;
