"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { useDashboard6Months } from "./useOverview";

export function ProfitRevenueBarChart() {
  const { data, isLoading } = useDashboard6Months();

  if (isLoading) return <div>Loading chart...</div>;

  const chartData = data?.map((item) => ({
    month: `${item.month}/${String(item.year).slice(-2)}`,
    revenue: item.revenue,
    profit: item.profit,
  }));

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
    profit: {
      label: "Profit",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Revenue vs Profit</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <YAxis
              tickFormatter={(v) => `${v.toLocaleString("de-DE")}`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={4}
            />
            <Bar
              dataKey="profit"
              fill="var(--color-profit)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Finance performance for last 6 months{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Revenue vs Profit
        </div>
      </CardFooter>
    </Card>
  );
}
