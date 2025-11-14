"use client";
import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
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
  const { data, isLoading, isError } = useGetCheckOutMain({
    page,
    page_size: pageSize,
  });
  const {
    data: statistic,
    isLoading: isLoadingStatistic,
    isError: isErrorStatistic,
  } = useGetCheckOutStatistic();

  const mergedStatistic = [
    {
      total: statistic?.order_processing ?? 0,
      label: "Orders Processing",
      textColor: "rgb(41, 171, 226)",
      isMain: true,
    },
    {
      total: statistic?.processing_transaction ?? 0,
      label: "Processing Transaction",
      textColor: "rgb(255, 11, 133)",
    },
    {
      total: statistic?.cancel_transaction ?? 0,
      label: "Returned",
      textColor: "rgba(242, 5, 5, 0.8)",
    },
    {
      total: statistic?.completed_transaction ?? 0,
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
          <ProductStatistic statistic={mergedStatistic} />
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
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
