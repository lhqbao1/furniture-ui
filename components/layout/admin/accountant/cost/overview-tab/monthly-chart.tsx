"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

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
import { useCheckoutDashboardLast6Months } from "@/features/checkout/hook";

export const description = "A line chart with a label";

export function MonthlyChart() {
  const { chartData, isLoading } = useCheckoutDashboardLast6Months();

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 6 Months</CardTitle>
        <CardDescription>Total revenue</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={{
            total: {
              label: "Revenue",
              color: "var(--chart-1)",
            },
          }}
        >
          <LineChart
            data={chartData}
            margin={{ top: 20, left: 40, right: 40 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Line
              dataKey="total"
              type="natural"
              stroke="var(--color-total)"
              strokeWidth={2}
              dot={{ fill: "var(--color-total)" }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
