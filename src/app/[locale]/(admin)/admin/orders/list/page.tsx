"use client";
import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
import OrderExpandTable from "@/components/layout/admin/orders/order-list/expand-delivery";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductStatistic from "@/components/layout/admin/products/products-list/statistic";
import DownloadInvoiceButton from "@/components/layout/pdf/download-invoice-button";
import AdminBackButton from "@/components/shared/admin-back-button";
import ProductStatisticSkeleton from "@/components/shared/statistic-skeleton";
import ProductTableSkeleton from "@/components/shared/table-skeleton";
import { getCheckOutMain } from "@/features/checkout/api";
import {
  useGetCheckOut,
  useGetCheckOutMain,
  useGetCheckOutStatistic,
} from "@/features/checkout/hook";
import React, { useState } from "react";

const OrderList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [fromDate, setFromDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const { data, isLoading, isError } = useGetCheckOutMain({
    page,
    page_size: pageSize,
  });

  // OrderList.tsx (chỉ phần liên quan)
  const params =
    fromDate && endDate ? { from_date: fromDate, to_date: endDate } : undefined;

  const {
    data: statistic,
    isLoading: isLoadingStatistic,
    isError: isErrorStatistic,
  } = useGetCheckOutStatistic(params);

  const mergedStatistic = [
    {
      count: statistic?.count_order,
      total: statistic?.total_order ?? 0,
      label: "Orders",
      textColor: "rgb(41, 171, 226)",
    },
    {
      count: statistic?.count_return_cancel_order,
      total: statistic?.total_return_cancel_order ?? 0,
      label: "Returned",
      textColor: "rgb(255, 11, 133)",
    },
    {
      count: statistic?.count_processing_order,
      total: statistic?.total_processing_order ?? 0,
      label: "Processing",
      textColor: "rgba(242, 5, 5, 0.8)",
    },
    {
      count: statistic?.count_completed_order,
      total: statistic?.total_completed_order ?? 0,
      label: "Done",
      textColor: "rgb(81, 190, 140)",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <div className="space-y-12 pb-30">
        {isLoadingStatistic || !statistic ? (
          <ProductStatisticSkeleton />
        ) : (
          <ProductStatistic
            statistic={mergedStatistic}
            isOrder
            fromDate={fromDate}
            endDate={endDate}
            setFromDate={setFromDate}
            setEndDate={setEndDate}
          />
        )}
        <div className="text-3xl text-secondary font-bold text-center">
          Order List
        </div>
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
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={data?.pagination.total_items ?? 0}
            totalPages={data?.pagination.total_pages ?? 0}
            hasBackground
            hasExpanded
            renderRowSubComponent={(row) => <OrderExpandTable row={row} />}
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
