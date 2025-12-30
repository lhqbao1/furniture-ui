"use client";
import ProductStatistic from "@/components/layout/admin/products/products-list/statistic";
import ProductStatisticSkeleton from "@/components/shared/statistic-skeleton";
import { useGetCheckOutStatistic } from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import React, { useState } from "react";

const AdminPage = () => {
  const [fromDate, setFromDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
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
      label: "Orders",
      textColor: "rgb(41, 171, 226)",
    },
    {
      count: statistic?.count_return_cancel_order,
      total: statistic?.total_return_cancel_order ?? 0,
      label: "Returned & Cancelled",
      textColor: "rgba(242, 5, 5, 0.8)",
    },
    {
      count: statistic?.count_processing_order,
      total: statistic?.total_processing_order ?? 0,
      label: "Processing",
      textColor: "rgb(255, 11, 133)",
    },
    {
      count: statistic?.count_completed_order,
      total: statistic?.total_completed_order ?? 0,
      label: "Done",
      textColor: "rgb(81, 190, 140)",
    },
  ];
  return (
    <div>
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
    </div>
  );
};

export default AdminPage;
