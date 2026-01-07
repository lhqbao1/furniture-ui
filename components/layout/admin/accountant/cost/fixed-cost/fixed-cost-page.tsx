"use client";

import { Button } from "@/components/ui/button";
import { useFixedCostForm } from "./useFixedCostForm";
import { FixedCostHeader } from "./fixed-cost-header";
import { FixedCostList } from "./fixed-cost-list";
import { useMemo } from "react";
import { getTrend } from "@/hooks/getTrends";
import { Info, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { formatEUR } from "@/lib/format-euro";
import { FixedCostLast6MonthsChart } from "./fixed-cost-chart";

export default function FixedCostPage() {
  const {
    month,
    year,
    setMonth,
    setYear,
    items,
    isLoading,
    isReadonly,
    updateItem,
    removeRow,
    addRow,
    submit,
    isSubmitting,
    hasChanges,
    totalFee,
    prevMonthTotalFee, // 👈 thêm cái này
  } = useFixedCostForm();

  const trend = useMemo(() => {
    return getTrend(totalFee, prevMonthTotalFee);
  }, [totalFee, prevMonthTotalFee]);

  return (
    <div className="space-y-4 grid grid-cols-3 gap-6 xl:gap-14">
      <div className="xl:col-span-1 col-span-3 space-y-4">
        <FixedCostHeader
          month={month}
          year={year}
          setMonth={setMonth}
          setYear={setYear}
          isReadonly={isReadonly}
        />

        <FixedCostList
          items={items}
          isLoading={isLoading}
          isReadonly={isReadonly}
          onUpdate={updateItem}
          onRemove={removeRow}
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={addRow}
            // disabled={isReadonly}
          >
            + Add new cost
          </Button>

          <Button
            onClick={submit}
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? "Submitting..." : "Submit fixed costs"}
          </Button>
        </div>

        <div className="flex flex-col gap-2 font-medium leading-none mt-8">
          {/* 👉 TOTAL hiện tại */}
          <span className="text-foreground text-xl">
            Total: {formatEUR(totalFee)}
          </span>

          {/* 👉 TREND */}
          {trend.direction === "up" && (
            <div>
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-red-600">
                Trending up by {trend.percent.toFixed(1)}% compared to last
                month
              </span>
            </div>
          )}

          {trend.direction === "down" && (
            <div className="flex gap-2 items-center">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-green-600">
                Down by {trend.percent.toFixed(1)}% compared to last month
              </span>
            </div>
          )}

          {trend.direction === "neutral" && (
            <div className="flex gap-2 items-center">
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                No change compared to last month
              </span>
            </div>
          )}

          {trend.direction === "no-data" && (
            <div className="flex gap-2 items-center">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                No data available for last month
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="xl:col-span-2 col-span-3">
        <FixedCostLast6MonthsChart />
      </div>
    </div>
  );
}
