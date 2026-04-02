"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCheckOutDashboard,
  useGetCheckOutStatistic,
  useGetProductsCheckOutDashboard,
} from "@/features/checkout/hook";
import { getPreviousMonthRange } from "@/hooks/get-previous-month";
import { cn } from "@/lib/utils";
import { MarketplaceOverviewItem, ProviderItem } from "@/types/checkout";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Boxes,
  CheckCircle2,
  Clock3,
  Euro,
  PackageCheck,
  RotateCcw,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { ChartBarMultiple } from "../accountant/cost/overview-tab/column-chart";
import { MonthlyChart } from "../accountant/cost/overview-tab/monthly-chart";
import { ChartPieLabelList } from "../accountant/cost/overview-tab/pie-chart";

interface EcommerceDashboardProps {
  fromDate?: string;
  toDate?: string;
}

type CardTone = "emerald" | "orange" | "red" | "violet" | "blue";

interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: CardTone;
}

type AlertSeverity = "high" | "medium" | "low";

interface OperationalAlert {
  key: string;
  title: string;
  description: string;
  count: number;
  amount: number;
  severity: AlertSeverity;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const toneStyles: Record<
  CardTone,
  {
    bg: string;
    icon: string;
  }
> = {
  emerald: {
    bg: "bg-emerald-50/80",
    icon: "bg-emerald-100 text-emerald-700",
  },
  orange: {
    bg: "bg-orange-50/80",
    icon: "bg-orange-100 text-orange-700",
  },
  red: {
    bg: "bg-red-50/80",
    icon: "bg-red-100 text-red-700",
  },
  violet: {
    bg: "bg-violet-50/80",
    icon: "bg-violet-100 text-violet-700",
  },
  blue: {
    bg: "bg-blue-50/80",
    icon: "bg-blue-100 text-blue-700",
  },
};

const alertSeverityStyles: Record<
  AlertSeverity,
  {
    container: string;
    icon: string;
    badge: string;
    bar: string;
  }
> = {
  high: {
    container: "border-red-200 bg-red-50/40",
    icon: "bg-red-100 text-red-700",
    badge: "border-red-200 bg-red-100 text-red-700",
    bar: "bg-red-500",
  },
  medium: {
    container: "border-orange-200 bg-orange-50/40",
    icon: "bg-orange-100 text-orange-700",
    badge: "border-orange-200 bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
  },
  low: {
    container: "border-emerald-200 bg-emerald-50/40",
    icon: "bg-emerald-100 text-emerald-700",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
  },
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const hasDecimals = Math.abs(value % 1) > 0.001;
  return `${value.toLocaleString("de-DE", {
    minimumFractionDigits: hasDecimals ? 1 : 0,
    maximumFractionDigits: 1,
  })}%`;
}

function formatDateLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("de-DE").format(date);
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 2xl:grid-cols-3">
        <Skeleton className="h-[360px] rounded-2xl 2xl:col-span-2" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    </div>
  );
}

function MarketplaceRankingCard({
  data,
}: {
  data: MarketplaceOverviewItem[];
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Marketplaces</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No marketplace data available for the selected period.
          </div>
        ) : (
          data.map((item) => {
            const share = Math.max(0, Math.min(100, toNumber(item.percentage)));
            return (
              <div key={item.marketplace} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium capitalize">
                    {item.marketplace.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(toNumber(item.total_amount))}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-secondary"
                    style={{ width: `${share}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{toNumber(item.total_orders)} orders</span>
                  <span>{formatPercent(share)}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function TopProductsCard({
  providers,
}: {
  providers: ProviderItem[];
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Products (Provider ID)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {providers.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No product revenue data available for the selected period.
          </div>
        ) : (
          providers.map((item, index) => (
            <div
              key={`${item.id_provider}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.id_provider || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {toNumber(item.total_quantity).toLocaleString("de-DE")} units
                </p>
              </div>
              <p className="text-sm font-semibold">
                {formatCurrency(toNumber(item.total_amount))}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ActionCenterCard({
  alerts,
  backlog,
  atRiskValue,
}: {
  alerts: OperationalAlert[];
  backlog: number;
  atRiskValue: number;
}) {
  const highPriorityCount = alerts.filter((item) => item.severity === "high").length;
  const busiestAlert = alerts[0];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Operational Command Center</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{alerts.length} active alerts</Badge>
            <Badge variant="outline">{highPriorityCount} high priority</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Operational backlog
            </p>
            <p className="mt-1 text-xl font-semibold">
              {backlog.toLocaleString("de-DE")}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Revenue at risk
            </p>
            <p className="mt-1 text-xl font-semibold">{formatCurrency(atRiskValue)}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Biggest queue
            </p>
            <p className="mt-1 text-sm font-semibold">
              {busiestAlert
                ? `${busiestAlert.title} (${busiestAlert.count.toLocaleString("de-DE")})`
                : "No queue pressure"}
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-700">All clear</p>
              <p className="text-muted-foreground">
                No operational issues detected for this period.
              </p>
            </div>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = alert.icon;
            const styles = alertSeverityStyles[alert.severity];
            const width =
              backlog > 0
                ? Math.max(14, Math.min(100, (alert.count / backlog) * 100))
                : 14;

            return (
            <div
              key={alert.key}
              className={cn(
                "rounded-xl border p-3 transition-shadow hover:shadow-sm",
                styles.container,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={cn("mt-0.5 rounded-lg p-2", styles.icon)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", styles.badge)}
                      >
                        {alert.severity} priority
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-0.5">
                        {alert.count.toLocaleString("de-DE")} orders
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5">
                        Impact: {formatCurrency(alert.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  hasEffect={false}
                >
                  <Link href={alert.href}>
                    Review
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted">
                <div
                  className={cn("h-1.5 rounded-full", styles.bar)}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function EcommerceDashboard({
  fromDate,
  toDate,
}: EcommerceDashboardProps) {
  const params = useParams<{ locale?: string }>();
  const localePrefix =
    typeof params?.locale === "string" && params.locale.length > 0
      ? `/${params.locale}`
      : "";

  const buildOrderListUrl = React.useCallback(
    (status: string) =>
      `${localePrefix}/admin/orders/list?status=${encodeURIComponent(status)}`,
    [localePrefix],
  );

  const hasCustomRange = Boolean(fromDate && toDate);

  const selectedMonth = React.useMemo(
    () => (fromDate ? new Date(fromDate) : new Date()),
    [fromDate],
  );

  const previousRange = React.useMemo(
    () => getPreviousMonthRange(selectedMonth),
    [selectedMonth],
  );

  const {
    data: statistic,
    isLoading: isStatisticLoading,
    isError: isStatisticError,
  } = useGetCheckOutStatistic({
    from_date: fromDate,
    to_date: toDate,
  });

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useGetCheckOutDashboard({
    from_date: fromDate,
    to_date: toDate,
  });

  const { data: previousDashboard } = useGetCheckOutDashboard(previousRange);

  const {
    data: productOverview,
    isLoading: isProductOverviewLoading,
    isError: isProductOverviewError,
  } = useGetProductsCheckOutDashboard({
    from_date: fromDate,
    to_date: toDate,
  });

  const hasAnyData = Boolean(statistic || dashboard || productOverview);
  const isLoading =
    (isStatisticLoading || isDashboardLoading || isProductOverviewLoading) &&
    !hasAnyData;

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (
    !hasAnyData &&
    (isStatisticError || isDashboardError || isProductOverviewError)
  ) {
    return (
      <Card className="rounded-2xl border-destructive/25">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Dashboard data could not be loaded
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Please refresh the page or check your API connection.
        </CardContent>
      </Card>
    );
  }

  const totalOrders = toNumber(statistic?.count_order);
  const totalRevenue = toNumber(statistic?.total_order);
  const returnedOrders = toNumber(statistic?.count_return_order);
  const returnedRevenue = toNumber(statistic?.total_return_order);
  const canceledOrders = toNumber(statistic?.count_cancel_order);
  const canceledRevenue = toNumber(statistic?.total_cancel_order);
  const waitingPaymentOrders = toNumber(statistic?.count_waiting_payment_order);
  const waitingPaymentRevenue = toNumber(statistic?.total_waiting_payment_order);
  const preparingOrders = toNumber(statistic?.count_preparing_shipping_order);
  const preparingRevenue = toNumber(statistic?.total_preparing_shipping_order);
  const stockReservedOrders = toNumber(statistic?.count_stock_reserved_order);
  const stockReservedRevenue = toNumber(statistic?.total_stock_reserved_order);
  const dispatchedOrders = toNumber(statistic?.count_dispatched_order);
  const dispatchedRevenue = toNumber(statistic?.total_dispatched_order);

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;
  const cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;
  const fulfillmentRate =
    totalOrders > 0 ? (dispatchedOrders / totalOrders) * 100 : 0;
  const netRevenue = Math.max(
    0,
    totalRevenue - returnedRevenue - canceledRevenue,
  );
  const operationalBacklog =
    waitingPaymentOrders + stockReservedOrders + preparingOrders;

  const kpis: DashboardMetric[] = [
    {
      label: "Gross Revenue",
      value: formatCurrency(totalRevenue),
      hint: `${totalOrders.toLocaleString("de-DE")} orders`,
      icon: Euro,
      tone: "emerald",
    },
    {
      label: "Net Revenue",
      value: formatCurrency(netRevenue),
      hint: "after returns and cancellations",
      icon: Wallet,
      tone: "blue",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(avgOrderValue),
      hint: "per order",
      icon: ShoppingCart,
      tone: "violet",
    },
    {
      label: "Return Rate",
      value: formatPercent(returnRate),
      hint: `${returnedOrders.toLocaleString("de-DE")} returned orders`,
      icon: RotateCcw,
      tone: returnRate >= 7 ? "red" : "orange",
    },
    {
      label: "Cancellation Rate",
      value: formatPercent(cancelRate),
      hint: `${canceledOrders.toLocaleString("de-DE")} canceled orders`,
      icon: Ban,
      tone: cancelRate >= 4 ? "red" : "orange",
    },
  ];

  const operationCards = [
    {
      label: "Waiting for Payment",
      count: waitingPaymentOrders,
      amount: waitingPaymentRevenue,
      icon: Clock3,
      tone: "orange" as CardTone,
    },
    {
      label: "Stock Reserved",
      count: stockReservedOrders,
      amount: stockReservedRevenue,
      icon: Boxes,
      tone: "violet" as CardTone,
    },
    {
      label: "Preparing Shipping",
      count: preparingOrders,
      amount: preparingRevenue,
      icon: PackageCheck,
      tone: "blue" as CardTone,
    },
    {
      label: "Dispatched + Exchange",
      count: dispatchedOrders,
      amount: dispatchedRevenue,
      icon: PackageCheck,
      tone: "emerald" as CardTone,
    },
  ];

  const operationalAlerts: OperationalAlert[] = [
    waitingPaymentOrders > 0
      ? {
          key: "waiting-payment",
          title: "Payment Pending Queue",
          description:
            "Orders are blocked until payment confirmation is received.",
          count: waitingPaymentOrders,
          amount: waitingPaymentRevenue,
          severity: waitingPaymentOrders >= 30 ? "high" : "medium",
          href: buildOrderListUrl("PENDING"),
          icon: Clock3,
        }
      : null,
    stockReservedOrders > 0
      ? {
          key: "stock-reserved",
          title: "Stock Reserved Queue",
          description:
            "Orders are waiting for stock allocation or inbound inventory.",
          count: stockReservedOrders,
          amount: stockReservedRevenue,
          severity: stockReservedOrders >= 40 ? "high" : "medium",
          href: buildOrderListUrl("STOCK_RESERVED"),
          icon: Boxes,
        }
      : null,
    preparingOrders > 0
      ? {
          key: "preparing-shipping",
          title: "Preparation Bottleneck",
          description:
            "Orders are in handling and need to move to dispatched quickly.",
          count: preparingOrders,
          amount: preparingRevenue,
          severity: preparingOrders >= 50 ? "high" : "medium",
          href: buildOrderListUrl("PREPARATION_SHIPPING"),
          icon: PackageCheck,
        }
      : null,
    returnedOrders > 0
      ? {
          key: "return-pressure",
          title: "Return Pressure",
          description:
            "Returned orders are increasing and should be analyzed by SKU/channel.",
          count: returnedOrders,
          amount: returnedRevenue,
          severity: returnRate >= 7 ? "high" : "low",
          href: buildOrderListUrl("RETURN,RETURN_ISSUE"),
          icon: RotateCcw,
        }
      : null,
    canceledOrders > 0
      ? {
          key: "cancellation-pressure",
          title: "Cancellation Pressure",
          description:
            "Cancellations impact revenue quality and customer confidence.",
          count: canceledOrders,
          amount: canceledRevenue,
          severity: cancelRate >= 4 ? "high" : "low",
          href: buildOrderListUrl(
            "CANCELED,CANCEL_REQUEST,CANCELED_NO_STOCK,CANCELED_WRONG_PRICE",
          ),
          icon: AlertTriangle,
        }
      : null,
  ] 
    .filter((item): item is OperationalAlert => Boolean(item))
    .sort((a, b) => {
      const priorityRank: Record<AlertSeverity, number> = {
        high: 3,
        medium: 2,
        low: 1,
      };
      if (priorityRank[a.severity] !== priorityRank[b.severity]) {
        return priorityRank[b.severity] - priorityRank[a.severity];
      }
      return b.count - a.count;
    });

  const revenueAtRisk = operationalAlerts.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const marketplaceRanking = [...(dashboard?.data ?? [])]
    .sort((a, b) => toNumber(b.total_amount) - toNumber(a.total_amount))
    .slice(0, 6);

  const topProviders = [...(productOverview?.items ?? [])]
    .sort((a, b) => toNumber(b.total_amount) - toNumber(a.total_amount))
    .slice(0, 6);

  const periodLabel =
    hasCustomRange && fromDate && toDate
      ? `${formatDateLabel(fromDate)} - ${formatDateLabel(toDate)}`
      : "Entire period";

  return (
    <div className="space-y-6">
      <div className="grid auto-rows-fr items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((metric) => {
          const styles = toneStyles[metric.tone];
          const Icon = metric.icon;

          return (
            <Card
              key={metric.label}
              className={cn("h-full rounded-2xl border shadow-sm", styles.bg)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-semibold leading-tight">
                      {metric.value}
                    </p>
                  </div>
                  <span className={cn("rounded-lg p-2", styles.icon)}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{metric.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="h-full rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Operations Snapshot</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{periodLabel}</Badge>
              <Badge variant="outline">
                Fulfillment: {formatPercent(fulfillmentRate)}
              </Badge>
              <Badge variant="outline">
                Backlog: {operationalBacklog.toLocaleString("de-DE")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {operationCards.map((item) => {
            const Icon = item.icon;
            const styles = toneStyles[item.tone];
            return (
              <div
                key={item.label}
                className={cn(
                  "rounded-xl border p-4 shadow-sm transition-colors",
                  styles.bg,
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  <span className={cn("rounded-md p-1.5", styles.icon)}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-xl font-semibold">
                  {item.count.toLocaleString("de-DE")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid auto-rows-fr items-stretch gap-4 2xl:grid-cols-3">
        <div className="h-full 2xl:col-span-2">
          <MonthlyChart />
        </div>
        <ActionCenterCard
          alerts={operationalAlerts}
          backlog={operationalBacklog}
          atRiskValue={revenueAtRisk}
        />
      </div>

      <div className="grid auto-rows-fr items-stretch gap-4 2xl:grid-cols-3">
        <div className="h-full 2xl:col-span-2">
          {dashboard?.data?.length ? (
            <ChartBarMultiple data={dashboard.data} />
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">
                  Marketplace Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No marketplace data available for the selected period.
              </CardContent>
            </Card>
          )}
        </div>
        {dashboard?.data?.length ? (
          <ChartPieLabelList
            data={dashboard.data}
            total={toNumber(dashboard.grand_total_amount)}
            previousTotal={toNumber(previousDashboard?.grand_total_amount)}
            hasPrevious={hasCustomRange}
          />
        ) : (
          <MarketplaceRankingCard data={[]} />
        )}
      </div>

      <div className="grid auto-rows-fr items-stretch gap-4 xl:grid-cols-2">
        <MarketplaceRankingCard data={marketplaceRanking} />
        <TopProductsCard providers={topProviders} />
      </div>
    </div>
  );
}
