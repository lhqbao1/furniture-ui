"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarIcon,
  CalendarDays,
  Eye,
  MousePointerClick,
  RefreshCcw,
  ShoppingCart,
  Target,
  Users,
} from "lucide-react";

import type {
  AffiliateFunnelResponse,
  AffiliateFunnelSteps,
} from "@/features/affiliate/api";
import {
  useGetAffiliates,
  useGetAffiliateFunnels,
} from "@/features/affiliate/hook";
import type { AffiliateResponse } from "@/types/affiliate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const emptySteps: AffiliateFunnelSteps = {
  clicks: 0,
  sessions: 0,
  page_views: 0,
  orders: 0,
  conversions: 0,
};

const emptyFunnel: AffiliateFunnelResponse = {
  steps: emptySteps,
  conversion_rates: {
    click_to_session: 0,
    session_to_view: 0,
    view_to_order: 0,
    order_to_conversion: 0,
  },
};

const emptyAffiliates: AffiliateResponse[] = [];

const affiliateOutputChartConfig = {
  clicks: {
    label: "Clicks",
    color: "#10b981",
  },
  orders: {
    label: "Orders",
    color: "#f59e0b",
  },
  conversions: {
    label: "Conversions",
    color: "#f97316",
  },
} satisfies ChartConfig;

const funnelStages = [
  {
    key: "clicks",
    label: "Clicks",
    description: "Affiliate link traffic",
    icon: MousePointerClick,
    color: "bg-emerald-500",
  },
  {
    key: "sessions",
    label: "Sessions",
    description: "Tracked browser sessions",
    icon: Users,
    color: "bg-teal-500",
  },
  {
    key: "page_views",
    label: "Page views",
    description: "Tracked page visits",
    icon: Eye,
    color: "bg-sky-500",
  },
  {
    key: "orders",
    label: "Orders",
    description: "Checkout orders",
    icon: ShoppingCart,
    color: "bg-amber-500",
  },
  {
    key: "conversions",
    label: "Conversions",
    description: "Completed checkouts",
    icon: Target,
    color: "bg-orange-500",
  },
] as const;

type AffiliateDashboardRow = {
  affiliate: AffiliateResponse;
  funnel: AffiliateFunnelResponse;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("de-DE").format(value || 0);
};

const padDatePart = (value: number) => value.toString().padStart(2, "0");

const formatDateForApi = (date?: Date) => {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());

  return `${year}-${month}-${day}T00:00:00.000`;
};

const formatDateLabel = (date?: Date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatRate = (value: number) => {
  return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
};

const calculateRate = (from: number, to: number) => {
  if (!from) return 0;
  return (to / from) * 100;
};

const normalizeFunnel = (
  funnel?: AffiliateFunnelResponse | null,
): AffiliateFunnelResponse => {
  return {
    steps: {
      clicks: funnel?.steps?.clicks ?? 0,
      sessions: funnel?.steps?.sessions ?? 0,
      page_views: funnel?.steps?.page_views ?? 0,
      orders: funnel?.steps?.orders ?? 0,
      conversions: funnel?.steps?.conversions ?? 0,
    },
    conversion_rates: {
      click_to_session: funnel?.conversion_rates?.click_to_session ?? 0,
      session_to_view: funnel?.conversion_rates?.session_to_view ?? 0,
      view_to_order: funnel?.conversion_rates?.view_to_order ?? 0,
      order_to_conversion: funnel?.conversion_rates?.order_to_conversion ?? 0,
    },
  };
};

const sumSteps = (rows: AffiliateDashboardRow[]): AffiliateFunnelSteps => {
  return rows.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.funnel.steps.clicks,
      sessions: acc.sessions + row.funnel.steps.sessions,
      page_views: acc.page_views + row.funnel.steps.page_views,
      orders: acc.orders + row.funnel.steps.orders,
      conversions: acc.conversions + row.funnel.steps.conversions,
    }),
    { ...emptySteps },
  );
};

const AffiliateDashboard = () => {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const affiliateQuery = useGetAffiliates();
  const affiliates = affiliateQuery.data ?? emptyAffiliates;
  const affiliateIds = useMemo(
    () => affiliates.map((affiliate) => affiliate.id).filter(Boolean),
    [affiliates],
  );

  const funnelParams = useMemo(
    () => ({
      ...(fromDate && { from_date: formatDateForApi(fromDate) }),
      ...(toDate && { to_date: formatDateForApi(toDate) }),
    }),
    [fromDate, toDate],
  );

  const funnelQueries = useGetAffiliateFunnels(
    affiliateIds,
    funnelParams,
    affiliateQuery.isSuccess && affiliateIds.length > 0,
  );

  const rows = useMemo<AffiliateDashboardRow[]>(() => {
    return affiliates.map((affiliate, index) => ({
      affiliate,
      funnel: normalizeFunnel(funnelQueries[index]?.data ?? emptyFunnel),
    }));
  }, [affiliates, funnelQueries]);

  const totals = useMemo(() => sumSteps(rows), [rows]);
  const aggregateRates = useMemo(
    () => ({
      click_to_session: calculateRate(totals.clicks, totals.sessions),
      session_to_view: calculateRate(totals.sessions, totals.page_views),
      view_to_order: calculateRate(totals.page_views, totals.orders),
      order_to_conversion: calculateRate(totals.orders, totals.conversions),
    }),
    [totals],
  );

  const chartData = useMemo(() => {
    return rows
      .map((row) => ({
        name: row.affiliate.name || row.affiliate.code || "Affiliate",
        code: row.affiliate.code,
        clicks: row.funnel.steps.clicks,
        orders: row.funnel.steps.orders,
        conversions: row.funnel.steps.conversions,
      }))
      .sort(
        (a, b) =>
          b.conversions - a.conversions ||
          b.orders - a.orders ||
          b.clicks - a.clicks,
      )
      .slice(0, 8);
  }, [rows]);

  const isLoading =
    affiliateQuery.isLoading || funnelQueries.some((query) => query.isLoading);
  const hasError =
    affiliateQuery.isError || funnelQueries.some((query) => query.isError);
  const maxStageValue = Math.max(
    ...funnelStages.map((stage) => totals[stage.key]),
    1,
  );

  const handleResetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <main className="min-h-screen bg-[#f6f8f4] px-4 py-6 text-slate-950 md:px-8">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative isolate overflow-hidden border-b border-emerald-100 px-6 py-8 md:px-8">
            <div className="absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />
            <div className="absolute right-36 top-10 -z-10 h-36 w-36 rounded-full bg-orange-100 blur-2xl" />

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  Affiliate workspace
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                  Performance Dashboard
                </h1>
              </div>

              <div className="grid gap-3 rounded-[1.6rem] border border-emerald-100 bg-white/85 p-3 shadow-[0_18px_45px_rgba(16,185,129,0.14)] backdrop-blur md:grid-cols-[minmax(13rem,1fr)_minmax(13rem,1fr)_auto]">
                <DatePickerField
                  label="From"
                  date={fromDate}
                  onSelect={setFromDate}
                />
                <DatePickerField
                  label="To"
                  date={toDate}
                  onSelect={setToDate}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-auto h-[4.25rem] rounded-2xl border-emerald-100 bg-white px-6 text-slate-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={handleResetFilters}
                >
                  <RefreshCcw className="size-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-5">
            {funnelStages.map((stage) => {
              const Icon = stage.icon;

              return (
                <Card
                  key={stage.key}
                  className="border-slate-200 bg-white shadow-sm"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div>
                      <CardDescription>{stage.label}</CardDescription>
                      {isLoading ? (
                        <Skeleton className="mt-2 h-8 w-24" />
                      ) : (
                        <CardTitle className="mt-2 text-3xl">
                          {formatNumber(totals[stage.key])}
                        </CardTitle>
                      )}
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                      <Icon className="size-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500">
                      {stage.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {hasError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">
                Unable to load full affiliate analytics
              </CardTitle>
              <CardDescription className="text-red-600">
                Some dashboard requests failed. Check the API response or token
                before using these numbers for reporting.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Funnel Progression</CardTitle>
                  <CardDescription>
                    Total movement from affiliate click to completed checkout.
                  </CardDescription>
                </div>
                <CalendarDays className="size-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {funnelStages.map((stage) => {
                const value = totals[stage.key];
                const width = `${Math.max((value / maxStageValue) * 100, value ? 7 : 2)}%`;

                return (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-slate-700">
                        {stage.label}
                      </span>
                      {isLoading ? (
                        <Skeleton className="h-4 w-16" />
                      ) : (
                        <span className="font-semibold text-slate-950">
                          {formatNumber(value)}
                        </span>
                      )}
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${stage.color}`}
                        style={{ width }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="grid gap-3 pt-2 md:grid-cols-4">
                <RatePill
                  label="Click to session"
                  value={aggregateRates.click_to_session}
                />
                <RatePill
                  label="Session to view"
                  value={aggregateRates.session_to_view}
                />
                <RatePill
                  label="View to order"
                  value={aggregateRates.view_to_order}
                />
                <RatePill
                  label="Order to conversion"
                  value={aggregateRates.order_to_conversion}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Top Affiliate Output</CardTitle>
                  <CardDescription>
                    Ranked by conversions, then orders and clicks.
                  </CardDescription>
                </div>
                <BarChart3 className="size-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full rounded-2xl" />
              ) : chartData.length ? (
                <ChartContainer
                  config={affiliateOutputChartConfig}
                  className="h-72 w-full aspect-auto"
                >
                  <BarChart
                    data={chartData}
                    barGap={4}
                    barCategoryGap={24}
                    margin={{ top: 12, right: 8, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="code"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          className="min-w-44"
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="clicks"
                      fill="var(--color-clicks)"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="orders"
                      fill="var(--color-orders)"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="conversions"
                      fill="var(--color-conversions)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <EmptyState label="No affiliate funnel data yet." />
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Affiliate Breakdown</CardTitle>
              </div>
              <Badge variant="outline" className="w-fit">
                {formatNumber(affiliateIds.length)} affiliates
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : rows.length ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Page views</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">
                        View to order
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows
                      .slice()
                      .sort(
                        (a, b) =>
                          b.funnel.steps.conversions -
                            a.funnel.steps.conversions ||
                          b.funnel.steps.orders - a.funnel.steps.orders ||
                          b.funnel.steps.clicks - a.funnel.steps.clicks,
                      )
                      .map((row) => (
                        <TableRow key={row.affiliate.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {row.affiliate.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {row.affiliate.code}
                            </Badge>
                          </TableCell>
                          <NumberCell value={row.funnel.steps.clicks} />
                          <NumberCell value={row.funnel.steps.sessions} />
                          <NumberCell value={row.funnel.steps.page_views} />
                          <NumberCell value={row.funnel.steps.orders} />
                          <NumberCell value={row.funnel.steps.conversions} />
                          <TableCell className="text-right font-medium">
                            {formatRate(
                              row.funnel.conversion_rates.view_to_order,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState label="No affiliates found." />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

const NumberCell = ({ value }: { value: number }) => {
  return (
    <TableCell className="text-right font-medium">
      {formatNumber(value)}
    </TableCell>
  );
};

const RatePill = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">
        {formatRate(value)}
      </p>
    </div>
  );
};

const DatePickerField = ({
  label,
  date,
  onSelect,
}: {
  label: string;
  date?: Date;
  onSelect: (date?: Date) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <span className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-[3.75rem] justify-between rounded-2xl border-emerald-100 bg-white px-4 text-left shadow-sm hover:bg-emerald-50 hover:text-emerald-900"
          >
            <span className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-slate-950">
                {formatDateLabel(date)}
              </span>
            </span>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <CalendarIcon className="size-5" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-3xl border-emerald-100 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(value) => {
              onSelect(value);
              if (value) setOpen(false);
            }}
            captionLayout="dropdown"
            className="[--cell-size:2.6rem] rounded-2xl"
            buttonVariant="ghost"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      {label}
    </div>
  );
};

export default AffiliateDashboard;
