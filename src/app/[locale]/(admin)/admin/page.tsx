"use client";
import OrderDateFilter from "@/components/layout/admin/orders/order-list/filter/filter-order-date";
import OrderStatistic from "@/components/layout/admin/orders/order-list/statistics";
import ProductStatisticSkeleton from "@/components/shared/statistic-skeleton";
import { useGetCheckOutStatistic } from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import React, { useState } from "react";

const AdminPage = () => {
  const filters = useOrderListFilters();

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
    {
      count: statistic?.count_return_order,
      total: statistic?.total_return_order ?? 0,
      label: "Returned",
      textColor: "#F7931E",
    },
    {
      count: statistic?.count_cancel_order,
      total: statistic?.total_cancel_order ?? 0,
      label: "Canceled",
      textColor: "#FF0000",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="mt-6">
        <OrderDateFilter />
      </div>
      {isLoadingStatistic || !statistic ? (
        <ProductStatisticSkeleton />
      ) : (
        <OrderStatistic
          statistic={mergedStatistic}
          isOrder
        />
      )}
    </div>
  );
};

export default AdminPage;
