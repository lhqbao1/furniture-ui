"use client";

import { useGetCheckOutDashboard } from "@/features/checkout/hook";
import { Loader2, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { ChartPieLabelList } from "./overview-tab/pie-chart";
import {
  getMonthRange,
  getPreviousMonthRange,
} from "@/hooks/get-previous-month";
import { ChartBarMultiple } from "./overview-tab/column-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MonthlyChart } from "./overview-tab/monthly-chart";

const OverViewTab = () => {
  const searchParams = useSearchParams();

  const fromDateParam = searchParams.get("from_date") ?? undefined;
  const endDateParam = searchParams.get("to_date") ?? undefined;

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
  } = useGetCheckOutDashboard({
    from_date: fromDateParam,
    to_date: endDateParam,
  });

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
    <Card>
      <CardHeader>
        <CardTitle>Marketplace Performance</CardTitle>
        <CardDescription>Revenue by marketplace</CardDescription>
      </CardHeader>

      <CardContent className="xl:px-6 px-2">
        <div className="xl:space-y-6 space-y-12 grid grid-cols-1 2xl:grid-cols-2 xl:gap-6 gap-0">
          <div className="col-span-1">
            <ChartPieLabelList
              data={currentData.data}
              total={currentData.grand_total_amount}
              previousTotal={previousData.grand_total_amount}
              hasPrevious={fromDateParam && endDateParam ? true : false}
            />
          </div>

          <ChartBarMultiple data={currentData.data} />

          <div className="2xl:col-span-2">
            <div className="xl:w-1/2 w-full mx-auto">
              <MonthlyChart />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverViewTab;
