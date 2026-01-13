"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

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

interface ChartBarMultipleProps {
  data: MarketplaceOverviewItem[];
}

export function ChartBarMultiple({ data }: ChartBarMultipleProps) {
  const chartData = data.map((item) => ({
    marketplace: item.marketplace,
    total_amount: item.total_amount,
    total_orders: item.total_orders,
  }));

  const chartConfig = {
    total_amount: {
      label: "Revenue (€)",
      color: "var(--chart-1)",
    },
    total_orders: {
      label: "Orders",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  if (!chartData.length) return null;

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="xl:p-3"
      >
        <BarChart
          data={chartData}
          margin={{ top: 20 }}
        >
          <CartesianGrid vertical={false} />

          <XAxis dataKey="marketplace" />

          {/* LEFT: REVENUE */}
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `${v.toLocaleString("de-DE")} €`}
          />

          {/* RIGHT: ORDERS */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, "auto"]}
            tickFormatter={(v) => `${v}`}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (name === "total_amount") {
                    return [`${Number(value).toLocaleString("de-DE")}€`];
                  }
                  return [`${value}`, "Orders"];
                }}
              />
            }
          />

          {/* 🔹 BAR: REVENUE */}
          <Bar
            yAxisId="left"
            dataKey="total_amount"
            fill="var(--color-total_amount)"
            radius={[6, 6, 0, 0]}
          />

          {/* 🔹 LINE: ORDERS */}
          <Line
            yAxisId="right"
            dataKey="total_orders"
            type="monotone"
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </BarChart>
      </ChartContainer>
      <div className="flex flex-col items-center">
        <div className="flex gap-2 font-medium leading-none text-sm text-secondary">
          Marketplace comparison overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-sm">
          Total revenue vs order volume
        </div>
      </div>
    </div>
  );
}
