"use client";

import { useGetCheckOutDashboard } from "@/features/checkout/hook";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { ChartPieLabelList } from "./overview-tab/pie-chart";
import {
  getMonthRange,
  getPreviousMonthRange,
} from "@/hooks/get-previous-month";
import { ChartBarMultiple } from "./overview-tab/column-chart";

const OverViewTab = () => {
  const searchParams = useSearchParams();

  const fromDateParam = searchParams.get("from_date") ?? undefined;

  // 🔹 Tháng đang chọn
  const selectedMonth = React.useMemo(
    () => (fromDateParam ? new Date(fromDateParam) : new Date()),
    [fromDateParam],
  );

  // 🔹 Range tháng hiện tại
  const currentRange = React.useMemo(
    () => getMonthRange(selectedMonth),
    [selectedMonth],
  );

  // 🔹 Range tháng trước
  const previousRange = React.useMemo(
    () => getPreviousMonthRange(selectedMonth),
    [selectedMonth],
  );

  // 🔹 Fetch tháng hiện tại
  const {
    data: currentData,
    isLoading: isCurrentLoading,
    isError: isCurrentError,
  } = useGetCheckOutDashboard(currentRange);

  // 🔹 Fetch tháng trước
  const {
    data: previousData,
    isLoading: isPrevLoading,
    isError: isPrevError,
  } = useGetCheckOutDashboard(previousRange);

  if (isCurrentLoading || isPrevLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (!currentData || !previousData || isPrevError) return <>Error</>;

  return (
    <div className="space-y-6 grid grid-cols-2 gap-6">
      <ChartPieLabelList
        data={currentData.data}
        total={currentData.grand_total_amount}
        previousTotal={previousData.grand_total_amount}
      />

      <ChartBarMultiple data={currentData.data} />

      {/* 🔥 Sau này dùng để so sánh */}
      {/* <ComparisonCard
        current={currentData.grand_total_amount}
        previous={previousData.grand_total_amount}
      /> */}
    </div>
  );
};

export default OverViewTab;
