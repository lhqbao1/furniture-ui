"use client";
import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
import OrderExpandTable from "@/components/layout/admin/orders/order-list/expand-delivery";
import OrderToolbar from "@/components/layout/admin/orders/order-list/order-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductStatistic from "@/components/layout/admin/products/products-list/statistic";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import ProductStatisticSkeleton from "@/components/shared/statistic-skeleton";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import {
  useGetCheckOutMain,
  useGetCheckOutStatistic,
} from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import OrderStatistic from "@/components/layout/admin/orders/order-list/statistics";

const OrderList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

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
      textColor: "#FED000",
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

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <div className="space-y-6 pb-30">
        {isLoadingStatistic || !statistic ? (
          <ProductStatisticSkeleton />
        ) : (
          <OrderStatistic
            statistic={mergedStatistic}
            isOrder
          />
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
        {isLoading ? (
          <ProductTableSkeleton
            columnsCount={6}
            rowsCount={6}
          />
        ) : (
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
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
