"use client";

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

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

interface ChartData {
  month: string;
  total: number;
  total_order: number;
}

type RevenueLabelProps = {
  x?: number;
  y?: number;
  value?: number;
  index?: number;
  payload?: any;
  chartData: ChartData[];
};

type OrdersLabelProps = {
  x?: number;
  y?: number;
  value?: number;
  payload?: any;
  chartData: ChartData[];
  index?: number;
};

function RevenueLabel({
  x = 0,
  y = 0,
  value,
  index,
  chartData,
}: RevenueLabelProps) {
  if (value == null || index == null) return null;

  const row = chartData[index];
  if (!row) return null;

  return (
    <text
      x={x}
      y={y - 8}
      textAnchor="middle"
      className="fill-foreground text-xs"
    >
      €{" "}
      {value.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </text>
  );
}

function OrdersLabel({
  x = 0,
  y = 0,
  value,
  index,
  chartData,
}: OrdersLabelProps) {
  if (value == null || index == null) return null;

  const row = chartData[index];
  if (!row) return null;

  // nếu revenue === order count → ẩn label orders
  if (row.total === row.total_order) return null;

  return (
    <text
      x={x}
      y={y - 8}
      textAnchor="middle"
      className="fill-muted-foreground text-xs"
    >
      {value} orders
    </text>
  );
}

export function MonthlyChart() {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });
  const { chartData, isLoading } = useCheckoutDashboardLast6Months();

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 6 Months</CardTitle>
        <CardDescription>Revenue & Orders</CardDescription>
      </CardHeader>

      <CardContent className="xl:px-6 px-2">
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
