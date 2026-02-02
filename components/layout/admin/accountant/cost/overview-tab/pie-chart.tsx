"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MarketplaceOverviewItem } from "@/types/checkout";
import React from "react";
import { getTrend } from "@/hooks/getTrends";

export const description = "A pie chart with a label list";

const chartConfig = {
  percentage: {
    label: "Marketplaces",
  },
  praktiker: { label: "Praktiker" },
  check24: { label: "Check24" },
  norma: { label: "Norma24" },
  amazon: { label: "Amazon" },
  freakout: { label: "Freakout" },
  netto: { label: "Netto" },
  ebay: { label: "Ebay" },
  inprodius: { label: "Inprodius" },
  prestige_home: { label: "Prestige Home" },
  kaufland: { label: "Kaufland" }, // ✅ ADD
} satisfies ChartConfig;

const MARKETPLACE_COLORS: Record<string, string> = {
  praktiker: "#01A1F7",
  check24: "#01A1F5",
  norma: "#01A1F7",
  amazon: "#FF9900",
  freakout: "#7C3AED",
  netto: "#FAD85B",
  ebay: "#0064D2",
  inprodius: "#4A4A4A",
  prestige_home: "#00b159",
  kaufland: "rgb(225, 9, 21)", // ✅ Kaufland red
};

interface ChartPieLabelListProps {
  data: MarketplaceOverviewItem[];
  total: number;
  previousTotal: number;
  hasPrevious: boolean;
}

export function ChartPieLabelList({
  data,
  total,
  previousTotal,
  hasPrevious,
}: ChartPieLabelListProps) {
  // 🔹 MAP API → Chart data
  const chartData = data.map((item) => ({
    marketplace: item.marketplace,
    percentage: item.percentage,
    fill: MARKETPLACE_COLORS[item.marketplace] ?? "#888888",
  }));

  const trend = React.useMemo(
    () => getTrend(total, previousTotal),
    [total, previousTotal],
  );

  if (!chartData.length) return null;

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[350px] xl:w-[400px] w-full pb-0"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="marketplace"
                hideLabel
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="percentage"
            nameKey="marketplace"
          />
          <ChartLegend
            content={<ChartLegendContent nameKey="marketplace" />}
            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
          />
        </PieChart>
      </ChartContainer>

      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total:{" "}
          {total.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <TrendingUp className="h-4 w-4" />
        </div>
        {hasPrevious && (
          <div className="flex items-center gap-2 font-medium leading-none">
            {trend.direction === "up" && (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  Trending up by {trend.percent.toFixed(1)}% compared to last
                  month
                </span>
              </>
            )}

            {trend.direction === "down" && (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-red-600">
                  Down by {trend.percent.toFixed(1)}% compared to last month
                </span>
              </>
            )}

            {trend.direction === "neutral" && (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  No change compared to last month
                </span>
              </>
            )}
          </div>
        )}

        <div className="text-muted-foreground leading-none">
          Showing marketplace revenue distribution
        </div>
      </div>
    </div>
  );
}
