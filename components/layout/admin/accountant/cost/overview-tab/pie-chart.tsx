"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
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
  others: { label: "Others" },
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
const OTHERS_COLOR = "#9CA3AF";

interface ChartPieLabelListProps {
  data: MarketplaceOverviewItem[];
  total: number;
  previousTotal: number;
  hasPrevious: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMarketplaceLabel(raw: string) {
  if (raw === "others") return "Others";
  return raw
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ChartPieLabelList({
  data,
  total,
  previousTotal,
  hasPrevious,
}: ChartPieLabelListProps) {
  // Sort by revenue, keep top 5, aggregate rest into "Others"
  const chartData = React.useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0),
    );

    const top = sorted.slice(0, 5).map((item) => ({
      marketplace: item.marketplace,
      percentage: Number(item.percentage) || 0,
      total_amount: Number(item.total_amount) || 0,
      total_orders: Number(item.total_orders) || 0,
      fill: MARKETPLACE_COLORS[item.marketplace] ?? "#888888",
    }));

    if (sorted.length <= 5) return top;

    const rest = sorted.slice(5);
    const othersPercentage = rest.reduce(
      (sum, item) => sum + (Number(item.percentage) || 0),
      0,
    );
    const othersAmount = rest.reduce(
      (sum, item) => sum + (Number(item.total_amount) || 0),
      0,
    );
    const othersOrders = rest.reduce(
      (sum, item) => sum + (Number(item.total_orders) || 0),
      0,
    );

    if (othersPercentage <= 0) return top;

    return [
      ...top,
      {
        marketplace: "others",
        percentage: othersPercentage,
        total_amount: othersAmount,
        total_orders: othersOrders,
        fill: OTHERS_COLOR,
      },
    ];
  }, [data]);

  const trend = React.useMemo(
    () => getTrend(total, previousTotal),
    [total, previousTotal],
  );

  if (!chartData.length) return null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Top 5 marketplaces + Others</CardDescription>
          </div>
          <div className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Weighted by revenue
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="relative mx-auto w-full max-w-[220px]">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="marketplace"
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, "Share"]}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="percentage"
                    nameKey="marketplace"
                    innerRadius={62}
                    outerRadius={92}
                    strokeWidth={2}
                    paddingAngle={2}
                  />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Gross Revenue
                </span>
                <span className="text-lg font-semibold">{formatCompactCurrency(total)}</span>
              </div>
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Highest 5 marketplaces are displayed separately.
            </p>
          </div>

          <div className="grid content-start gap-2">
            {chartData.map((item) => {
              const share = Math.max(0, Math.min(100, Number(item.percentage) || 0));
              return (
                <div
                  key={item.marketplace}
                  className="rounded-xl border bg-background/80 p-3 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <p className="truncate text-sm font-medium">
                        {formatMarketplaceLabel(item.marketplace)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {share.toLocaleString("de-DE", {
                        minimumFractionDigits: share % 1 ? 1 : 0,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${share}%`, backgroundColor: item.fill }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(Number(item.total_amount) || 0)}</span>
                    <span>{(Number(item.total_orders) || 0).toLocaleString("de-DE")} orders</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total: {formatCurrency(total)}
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
      </CardFooter>
    </Card>
  );
}
