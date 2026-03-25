"use client";

import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
import OrderExpandRefund from "@/components/layout/admin/orders/order-list/expand-refund";
import OrderToolbar from "@/components/layout/admin/orders/order-list/order-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { ToolbarType } from "@/components/layout/admin/products/products-list/toolbar";
import { useGetCheckOutRefundOrders } from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { CheckOutMain } from "@/types/checkout";

const ReturnOrdersPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedOrders, setSelectedOrders] = useState<CheckOutMain[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useOrderListFilters();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    setPage(urlPage);
  }, [searchParams]);

  const { data, isLoading, isFetching, isError } = useGetCheckOutRefundOrders({
    page,
    page_size: pageSize,
    channel: filters.channel,
    search: filters.search,
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

  if (!data && isError) {
    return <div>No data</div>;
  }

  return (
    <div className="relative flex flex-col gap-6 pb-4">
      <div className="space-y-6">
        <div className="text-3xl text-secondary font-bold text-center">
          Return Orders
        </div>

        <OrderToolbar
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          type={ToolbarType.order}
          selectedOrders={selectedOrders}
        />

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
          renderRowSubComponent={(row) => <OrderExpandRefund row={row} />}
          hasHeaderBackGround
          isSticky
          stickyContainerClassName="h-full"
          onSelectedRowsChange={(rows) => setSelectedOrders(rows)}
        />
      </div>

      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <Loader2 className="size-10 animate-spin text-secondary" />
        </div>
      )}
    </div>
  );
};

export default ReturnOrdersPage;
