"use client";
import OverViewTab from "@/components/layout/admin/accountant/cost/overview-tabs";
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
      count: statistic?.count_order,
      total: statistic?.total_order ?? 0,
      label: "Total",
      textColor: "#39B54A",
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
    <div className="space-y-6 pb-6">
      <div className="mt-6">
        <OrderDateFilter />
      </div>
      {isLoadingStatistic || !statistic ? (
        <ProductStatisticSkeleton />
      ) : (
        <OrderStatistic
          statistic={mergedStatistic}
          isOrder
          isDashBoard
        />
      )}
      <OverViewTab />
    </div>
  );
};

export default AdminPage;
