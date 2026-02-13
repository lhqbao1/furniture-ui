"use client";
import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
import OrderExpandTable from "@/components/layout/admin/orders/order-list/expand-delivery";
import OrderToolbar from "@/components/layout/admin/orders/order-list/order-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import ProductStatisticSkeleton from "@/components/shared/statistic-skeleton";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import {
  useGetCheckOutMain,
  useGetCheckOutStatistic,
} from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import OrderStatistic from "@/components/layout/admin/orders/order-list/statistics";

const OrderList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useOrderListFilters();
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);
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

  const { data, isLoading, isError } = useGetCheckOutMain({
    page,
    page_size: pageSize,
    status: filters.status, // <-- thêm
    channel: filters.channel, // <-- thêm
    from_date: filters.fromDate,
    to_date: filters.toDate,
    search: filters.search,
  });

  const {
    data: statistic,
    isLoading: isLoadingStatistic,
    isError: isErrorStatistic,
  } = useGetCheckOutStatistic({
    from_date: filters.fromDate,
    to_date: filters.toDate,
  });

  const mergedStatistic = [
    {
      count: statistic?.count_dispatched_order,
      total: statistic?.total_dispatched_order ?? 0,
      label: "Dispatched",
      textColor: "#39B54A",
    },
    {
      count: statistic?.count_waiting_payment_order,
      total: statistic?.total_waiting_payment_order ?? 0,
      label: "Waiting for payment",
      textColor: "#9b59ff",
    },
    {
      count: statistic?.count_preparing_shipping_order,
      total: statistic?.total_preparing_shipping_order ?? 0,
      label: "Preparing Shipping",
      textColor: "#29ABE2",
    },
    {
      count: statistic?.count_stock_reserved_order,
      total: statistic?.total_stock_reserved_order ?? 0,
      label: "Stock Reserved",
      textColor: "#ff4f7b",
    },
  ];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const wrapper = tableWrapRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const bottomPadding = 24; // matches pb-6
      const available = window.innerHeight - rect.top - bottomPadding;
      setTableHeight(Math.max(240, available));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [data, isLoading]);

  if (!data && isLoading) {
    return <ProductTableSkeleton columnsCount={6} rowsCount={6} />;
  }

  if (!data && isError) {
    return <div>No data</div>;
  }

  return (
    <div className="h-screen flex flex-col gap-6 overflow-hidden">
      <div className="space-y-6">
        {isLoadingStatistic ? (
          <ProductStatisticSkeleton />
        ) : (
          <OrderStatistic statistic={mergedStatistic} isOrder />
        )}
        <div className="text-3xl text-secondary font-bold text-center">
          Order List
        </div>
        <OrderToolbar
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          type={ToolbarType.order}
        />
        {isLoading && !data ? (
          <ProductTableSkeleton columnsCount={6} rowsCount={6} />
        ) : (
          <div
            ref={tableWrapRef}
            className="min-h-0"
            style={tableHeight ? { height: `${tableHeight}px` } : undefined}
          >
            <ProductTable
              data={data ? data.items : []}
              columns={orderColumns}
              page={page}
              setPage={handlePageChange}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalItems={data?.pagination.total_items ?? 0}
              totalPages={data?.pagination.total_pages ?? 0}
              hasBackground
              hasExpanded
              renderRowSubComponent={(row) => <OrderExpandTable row={row} />}
              hasHeaderBackGround
              isSticky
              stickyContainerClassName="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
