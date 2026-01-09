"use client";
import React, { useState } from "react";
import { OverviewPageHeader } from "./overview-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetCheckOutDashboard,
  useGetProductsCheckOutDashboard,
} from "@/features/checkout/hook";
import { formatLocal, getMonthRange } from "@/hooks/get-month-range-by-month";
import { useQuery } from "@tanstack/react-query";
import { getFixedFeeWithTime } from "@/features/fixed-fee/api";
import { useGetVariableFeeByMarketplaceAndTime } from "@/features/variable-cost/hook";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewSkeleton } from "./skeleton";
import { ProfitRevenueBarChart } from "./overview-chart";
const OverviewPage = () => {
  const now = new Date();

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const { start, end } = getMonthRange(year, month);

  const from_date = formatLocal(start);
  const to_date = formatLocal(end);
  const {
    data: currentData,
    isLoading: isCurrentLoading,
    isError: isCurrentError,
  } = useGetCheckOutDashboard({
    from_date: from_date,
    to_date: to_date,
  });

  const { data, isLoading, isError } = useGetProductsCheckOutDashboard({
    from_date,
    to_date,
  });

  const { data: fixedFee, isLoading: isLoadingFixedFee } = useQuery({
    queryKey: ["fixed-fee-time", month, year],
    queryFn: () => getFixedFeeWithTime({ month, year }),
    enabled: Boolean(month && year),
  });

  const { data: variableFeeData } = useGetVariableFeeByMarketplaceAndTime({
    year,
    month,
  });

  const revenue = currentData?.grand_total_amount || 0;
  const productCost = data?.summary.total_cost || 0;
  const fixedCost = fixedFee?.total_fee || 0;
  const variableCost =
    typeof variableFeeData?.total === "number" ? variableFeeData.total : 0;
  const totalCost = productCost + fixedCost + variableCost;
  const profit = revenue - totalCost;

  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div>
      <OverviewPageHeader
        month={month}
        year={year}
        setMonth={setMonth}
        setYear={setYear}
      />

      {!currentData || !data || !fixedFee || !variableFeeData ? (
        <OverviewSkeleton />
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-semibold">
                €
                {currentData?.grand_total_amount.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Total Cost{" "}
                  <span className="text-xs font-light text-gray-400">
                    (Landed Cost + Fixed Cost + Variable Cost)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-semibold">
                €
                {totalCost.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <div className="text-xs font-light text-gray-400">
                  ( {productCost.toLocaleString("de-DE")} +{" "}
                  {fixedCost.toLocaleString("de-DE")} +{" "}
                  {variableCost.toLocaleString("de-DE")})
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-semibold flex items-center gap-2">
                €
                {profit.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span
                  className={cn(profit < 0 ? "text-red-600" : "text-secondary")}
                >
                  ({margin.toFixed(2)}%)
                </span>
                {profit < 0 ? (
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-secondary" />
                )}
              </CardContent>
            </Card>
          </div>

          <ProfitRevenueBarChart />
        </div>
      )}
    </div>
  );
};

export default OverviewPage;
