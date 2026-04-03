"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useCheckoutDashboardLast6Months } from "@/features/checkout/hook";
import { useMediaQuery } from "react-responsive";

interface MonthlyChartProps {
  isB2B?: boolean;
}

export function MonthlyChart({ isB2B }: MonthlyChartProps) {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });
  const { chartData, isLoading } = useCheckoutDashboardLast6Months(isB2B);

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Last 6 Months</CardTitle>
        <CardDescription>Revenue & Orders</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 xl:px-6 px-2">
        <ChartContainer
          config={{
            total: {
              label: "Revenue",
              color: "var(--chart-1)",
            },
            total_order: {
              label: "Orders",
              color: "var(--chart-2)",
            },
          }}
        >
          <LineChart
            data={chartData}
            margin={
              isMobile
                ? { top: 16, left: 0, right: 0 }
                : { top: 30, left: 40, right: 40 }
            }
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `€${v.toLocaleString("de-DE", {
                  maximumFractionDigits: 0,
                })}`
              }
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            {/* Revenue line */}
            <Line
              yAxisId="left"
              dataKey="total"
              type="natural"
              stroke="var(--color-total)"
              strokeWidth={2}
              dot={{ fill: "var(--color-total)" }}
            >
              {/* <LabelList content={<RevenueLabel chartData={chartData} />} /> */}
            </Line>

            {/* Orders line */}
            <Line
              yAxisId="right"
              dataKey="total_order"
              type="natural"
              stroke="var(--color-total_order)"
              strokeWidth={2}
              dot={{ fill: "var(--color-total_order)" }}
            >
              {/* <LabelList content={<OrdersLabel chartData={chartData} />} /> */}
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
