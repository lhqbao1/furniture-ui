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

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const REQUIRED_MARKETPLACES = ["prestige_home", "econelo"] as const;

const normalizeMarketplaceKey = (value: string) =>
  value.trim().toLowerCase().replace(/[\s-]+/g, "_");

export function ChartBarMultiple({ data }: ChartBarMultipleProps) {
  const normalizedData = data.map((item) => ({
    marketplace: item.marketplace,
    total_amount: toNumber(item.total_amount),
    total_orders: toNumber(item.total_orders),
  }));

  const existingMarketplaceKeys = new Set(
    normalizedData.map((item) => normalizeMarketplaceKey(item.marketplace)),
  );

  // Always keep Prestige Home + Econelo on chart even when revenue is low.
  const withRequiredMarketplaces = [...normalizedData];
  REQUIRED_MARKETPLACES.forEach((requiredKey) => {
    if (!existingMarketplaceKeys.has(requiredKey)) {
      withRequiredMarketplaces.push({
        marketplace: requiredKey,
        total_amount: 0,
        total_orders: 0,
      });
    }
  });

  const sortedData = withRequiredMarketplaces.sort(
    (a, b) => b.total_amount - a.total_amount,
  );

  const requiredSet = new Set(REQUIRED_MARKETPLACES);
  const mandatoryItems = sortedData.filter((item) =>
    requiredSet.has(normalizeMarketplaceKey(item.marketplace)),
  );

  const mandatoryKeys = new Set(
    mandatoryItems.map((item) => normalizeMarketplaceKey(item.marketplace)),
  );

  const nonMandatoryItems = sortedData.filter(
    (item) => !mandatoryKeys.has(normalizeMarketplaceKey(item.marketplace)),
  );

  const MAX_VISIBLE_MARKETPLACES = 9;
  const remainingSlots = Math.max(0, MAX_VISIBLE_MARKETPLACES - mandatoryItems.length);

  const topNine = [...mandatoryItems, ...nonMandatoryItems.slice(0, remainingSlots)]
    .sort((a, b) => b.total_amount - a.total_amount)
    .map((item) => ({
      marketplace: item.marketplace,
      total_amount: item.total_amount,
      total_orders: item.total_orders,
    }));

  const rest = nonMandatoryItems.slice(remainingSlots);
  const othersRevenue = rest.reduce(
    (sum, item) => sum + item.total_amount,
    0,
  );
  const othersOrders = rest.reduce(
    (sum, item) => sum + item.total_orders,
    0,
  );

  const chartData =
    rest.length > 0
      ? [
          ...topNine,
          {
            marketplace: "others",
            total_amount: othersRevenue,
            total_orders: othersOrders,
          },
        ]
      : topNine;

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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Marketplace Comparison</CardTitle>
        <CardDescription>
          Revenue vs order volume (Top 9 + Others)
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 xl:p-3">
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />

            <XAxis dataKey="marketplace" />

            <YAxis
              yAxisId="left"
              tickFormatter={(v) => `${v.toLocaleString("de-DE")} €`}
            />

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

            <Bar
              yAxisId="left"
              dataKey="total_amount"
              fill="var(--color-total_amount)"
              radius={[6, 6, 0, 0]}
            />

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
      </CardContent>

      <CardFooter className="flex-col items-center gap-1 text-sm">
        <div className="flex gap-2 font-medium leading-none text-secondary">
          Marketplace comparison overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total revenue vs order volume
        </div>
      </CardFooter>
    </Card>
  );
}
