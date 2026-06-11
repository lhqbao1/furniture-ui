"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  CalendarIcon,
  Eye,
  MousePointerClick,
  RefreshCcw,
  ShoppingCart,
  Target,
  type LucideIcon,
  Users,
} from "lucide-react";

import type {
  AffiliateClickEvent,
  AffiliateConversionEvent,
  AffiliateEventsPayload,
  AffiliateEventType,
  AffiliateOrderEvent,
  AffiliatePageViewEvent,
  AffiliateSessionEvent,
} from "@/features/affiliate/api";
import {
  useGetAffiliateEventGroups,
  useGetAffiliateFunnel,
  useGetAffiliatesByOwner,
} from "@/features/affiliate/hook";
import type { AffiliateResponse } from "@/types/affiliate";
import { adminIdAtom } from "@/store/auth";
import { useRouter } from "@/src/i18n/navigation";
import { useGetUserByIdAdmin } from "@/features/users/hook";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import AffiliateChannelIcon from "./affiliate-channel-icon";

const emptyAffiliates: AffiliateResponse[] = [];

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

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const normalized = value.endsWith("Z") ? value : `${value}Z`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatMoney = (value?: number | null) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0);
};

const getText = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const getEventRows = <TEvent,>(
  payload?: TEvent[] | {
    items?: TEvent[];
    results?: TEvent[];
    data?: TEvent[];
  },
) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getEventTotal = <TEvent,>(
  payload: TEvent[] | {
    items?: TEvent[];
    results?: TEvent[];
    data?: TEvent[];
    pagination?: { total_items?: number };
    total?: number;
    total_items?: number;
    count?: number;
  } | undefined,
  rows: TEvent[],
) => {
  if (!payload || Array.isArray(payload)) return rows.length;

  const total =
    payload.pagination?.total_items ??
    payload.total_items ??
    payload.total ??
    payload.count;

  return Number.isFinite(total) ? Number(total) : rows.length;
};

const useEventData = <TType extends AffiliateEventType>(
  payload?: AffiliateEventsPayload<TType>,
) => {
  const rows = getEventRows(payload);
  const total = getEventTotal(payload, rows);

  return { rows, total };
};

const AffiliateEventsPage = () => {
  const [selectedAffiliateId, setSelectedAffiliateId] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const ownerId = useAtomValue(adminIdAtom);

  const affiliateQuery = useGetAffiliatesByOwner(ownerId ?? undefined);
  const currentUserQuery = useGetUserByIdAdmin(ownerId ?? "");
  const affiliates = affiliateQuery.data ?? emptyAffiliates;
  const isCurrentUserAdmin = currentUserQuery.data?.is_admin === true;
  const affiliateIdFromUrl = searchParams.get("affiliate_id") ?? "";

  useEffect(() => {
    if (affiliates.length === 0) {
      setSelectedAffiliateId("");
      return;
    }

    const urlAffiliateExists = affiliates.some(
      (affiliate) => affiliate.id === affiliateIdFromUrl,
    );

    if (urlAffiliateExists) {
      setSelectedAffiliateId(affiliateIdFromUrl);
      return;
    }

    const selectedAffiliateExists = affiliates.some(
      (affiliate) => affiliate.id === selectedAffiliateId,
    );

    if (selectedAffiliateExists) return;
    setSelectedAffiliateId(affiliates[0].id);
  }, [affiliateIdFromUrl, affiliates, selectedAffiliateId]);

  const selectedAffiliateAllowed = useMemo(
    () => affiliates.some((affiliate) => affiliate.id === selectedAffiliateId),
    [affiliates, selectedAffiliateId],
  );

  const selectedAffiliate = useMemo(
    () =>
      affiliates.find((affiliate) => affiliate.id === selectedAffiliateId) ??
      null,
    [affiliates, selectedAffiliateId],
  );

  const eventParams = useMemo(
    () => ({
      ...(fromDate && { from_date: formatDateForApi(fromDate) }),
      ...(toDate && { to_date: formatDateForApi(toDate) }),
      page: 1,
      page_size: 50,
    }),
    [fromDate, toDate],
  );

  const eventQueries = useGetAffiliateEventGroups(
    selectedAffiliateId,
    eventParams,
    Boolean(selectedAffiliateId) && selectedAffiliateAllowed,
  );
  const funnelQuery = useGetAffiliateFunnel(
    selectedAffiliateId
      ? {
          affiliate_id: selectedAffiliateId,
          ...(fromDate && { from_date: formatDateForApi(fromDate) }),
          ...(toDate && { to_date: formatDateForApi(toDate) }),
        }
      : undefined,
    Boolean(selectedAffiliateId) && selectedAffiliateAllowed,
  );

  const clickEvents = useEventData<"click">(eventQueries[0]?.data);
  const pageViewEvents = useEventData<"page_view">(eventQueries[1]?.data);
  const sessionEvents = useEventData<"session">(eventQueries[2]?.data);
  const orderEvents = useEventData<"order">(eventQueries[3]?.data);
  const conversionEvents = useEventData<"conversion">(eventQueries[4]?.data);

  const clicks = clickEvents.rows as AffiliateClickEvent[];
  const pageViews = pageViewEvents.rows as AffiliatePageViewEvent[];
  const sessions = sessionEvents.rows as AffiliateSessionEvent[];
  const orders = orderEvents.rows as AffiliateOrderEvent[];
  const conversions = conversionEvents.rows as AffiliateConversionEvent[];

  const metrics = {
    clicks: funnelQuery.data?.steps.clicks ?? clickEvents.total,
    pageViews: funnelQuery.data?.steps.page_views ?? pageViewEvents.total,
    sessions: funnelQuery.data?.steps.sessions ?? sessionEvents.total,
    orders: funnelQuery.data?.steps.orders ?? orderEvents.total,
    conversions:
      funnelQuery.data?.steps.conversions ?? conversionEvents.total,
  };

  const isEventsLoading =
    affiliateQuery.isLoading || eventQueries.some((query) => query.isLoading);
  const isMetricsLoading = affiliateQuery.isLoading || funnelQuery.isLoading;
  const hasError =
    affiliateQuery.isError ||
    funnelQuery.isError ||
    eventQueries.some((query) => query.isError);

  const handleResetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleAffiliateChange = (affiliateId: string) => {
    setSelectedAffiliateId(affiliateId);

    const params = new URLSearchParams(searchParams);
    params.set("tab", "events");
    params.set("affiliate_id", affiliateId);

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-[#f6f8f4] px-4 py-6 text-slate-950 md:px-8">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-secondary/20 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative isolate overflow-hidden border-b border-secondary/20 px-6 py-8 md:px-8">
            <div className="absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute right-36 top-10 -z-10 h-36 w-36 rounded-full bg-orange-100 blur-2xl" />

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <Badge className="border border-secondary/20 bg-secondary/10 text-secondary hover:bg-secondary/10">
                  Affiliate events
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                  Channel Event Analytics
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Select one affiliate channel. This page calls the events API
                  once for each type: click, page_view, session, order, and
                  conversion.
                </p>
              </div>

              <div className="grid gap-3 rounded-[1.6rem] border border-secondary/20 bg-white/85 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur lg:grid-cols-[minmax(15rem,1.3fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_auto]">
                <div className="flex flex-col gap-2">
                  <span className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Channel
                  </span>
                  <Select
                    value={selectedAffiliateId}
                    onValueChange={handleAffiliateChange}
                  >
                    <SelectTrigger
                      className="h-[4.25rem] rounded-2xl border-secondary/20 bg-white px-4 text-slate-950 shadow-sm hover:bg-secondary/10"
                      iconColor="var(--color-secondary)"
                      placeholderColor
                    >
                      {selectedAffiliate ? (
                        <span className="flex min-w-0 items-center gap-2">
                          <AffiliateChannelIcon
                            code={selectedAffiliate.code}
                            name={selectedAffiliate.name}
                            size="sm"
                          />
                          <span className="truncate">
                            {selectedAffiliate.name || selectedAffiliate.code}
                          </span>
                        </span>
                      ) : (
                        <SelectValue placeholder="Select channel" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {affiliates.map((affiliate) => (
                        <SelectItem
                          key={affiliate.id}
                          value={affiliate.id}
                          textValue={affiliate.name || affiliate.code}
                        >
                          <span className="flex items-center gap-2">
                            <AffiliateChannelIcon
                              code={affiliate.code}
                              name={affiliate.name}
                              size="sm"
                            />
                            <span>{affiliate.name || affiliate.code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  className="mt-auto h-[4.25rem] rounded-2xl border-secondary/20 bg-white px-6 text-slate-700 shadow-sm hover:bg-secondary/10 hover:text-secondary"
                  onClick={handleResetFilters}
                >
                  <RefreshCcw className="size-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-5">
            <MetricCard
              label="Clicks"
              value={metrics.clicks}
              icon={MousePointerClick}
              loading={isMetricsLoading}
            />
            <MetricCard
              label="Page views"
              value={metrics.pageViews}
              icon={Eye}
              loading={isMetricsLoading}
            />
            <MetricCard
              label="Sessions"
              value={metrics.sessions}
              icon={Users}
              loading={isMetricsLoading}
            />
            <MetricCard
              label="Orders"
              value={metrics.orders}
              icon={ShoppingCart}
              loading={isMetricsLoading}
            />
            <MetricCard
              label="Conversions"
              value={metrics.conversions}
              icon={Target}
              loading={isMetricsLoading}
            />
          </div>
        </section>

        {hasError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">
                Unable to load all event data
              </CardTitle>
              <CardDescription className="text-red-600">
                One or more event requests failed for the selected channel.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>
                  {selectedAffiliate?.name ?? "Affiliate channel"}
                </CardTitle>
                <CardDescription>
                  {selectedAffiliate?.code
                    ? `Code: ${selectedAffiliate.code}`
                    : "Select a channel to inspect events."}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="w-fit"
              >
                {affiliates.length} channels
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isEventsLoading ? (
              <TableSkeleton />
            ) : (
              <Tabs defaultValue="click">
                <TabsList className="mb-4 grid h-auto grid-cols-2 gap-2 border-b-0 sm:flex sm:flex-wrap">
                  <EventTab
                    value="click"
                    label="Clicks"
                    count={metrics.clicks}
                  />
                  <EventTab
                    value="page_view"
                    label="Page views"
                    count={metrics.pageViews}
                  />
                  <EventTab
                    value="session"
                    label="Sessions"
                    count={metrics.sessions}
                  />
                  <EventTab
                    value="order"
                    label="Orders"
                    count={metrics.orders}
                  />
                  <EventTab
                    value="conversion"
                    label="Conversions"
                    count={metrics.conversions}
                  />
                </TabsList>

                <TabsContent value="click">
                  <ClickTable rows={clicks} />
                </TabsContent>
                <TabsContent value="page_view">
                  <PageViewTable rows={pageViews} />
                </TabsContent>
                <TabsContent value="session">
                  <SessionTable rows={sessions} />
                </TabsContent>
                <TabsContent value="order">
                  <OrderTable
                    rows={orders}
                    canOpenCheckout={isCurrentUserAdmin}
                    locale={locale}
                  />
                </TabsContent>
                <TabsContent value="conversion">
                  <ConversionTable rows={conversions} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

const EventTab = ({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count: number;
}) => {
  return (
    <TabsTrigger
      value={value}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 data-[state=active]:border-secondary/30 data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary"
    >
      {label}
      <Badge
        variant="outline"
        className="ml-1 rounded-full bg-white"
      >
        {count}
      </Badge>
    </TabsTrigger>
  );
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  loading: boolean;
}) => {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardDescription>{label}</CardDescription>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
          )}
        </div>
        <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
          <Icon className="size-5" />
        </div>
      </CardHeader>
    </Card>
  );
};

const ClickTable = ({ rows }: { rows: AffiliateClickEvent[] }) => {
  if (!rows.length) return <EmptyState label="No click events found." />;

  return (
    <DataTable>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead>Time</TableHead>
          <TableHead>UTM source</TableHead>
          <TableHead>Landing page</TableHead>
          <TableHead>Referrer</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>IP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDateTime(row.time)}</TableCell>
            <TableCell>{getText(row.utm_source)}</TableCell>
            <TableCell className="max-w-[360px] truncate">
              {getText(row.landing_page)}
            </TableCell>
            <TableCell className="max-w-[260px] truncate">
              {getText(row.referrer)}
            </TableCell>
            <TableCell>{getText(row.device)}</TableCell>
            <TableCell>
              {[row.city, row.country].filter(Boolean).join(", ") || "-"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {getText(row.ip)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
};

const PageViewTable = ({ rows }: { rows: AffiliatePageViewEvent[] }) => {
  if (!rows.length) return <EmptyState label="No page view events found." />;

  return (
    <DataTable>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead>Time</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="text-right">Time spent</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Country</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.time}-${row.url}`}>
            <TableCell>{formatDateTime(row.time)}</TableCell>
            <TableCell className="max-w-[520px] truncate">{row.url}</TableCell>
            <TableCell className="text-right font-medium">
              {row.time_spent}s
            </TableCell>
            <TableCell>{getText(row.device)}</TableCell>
            <TableCell>{getText(row.country)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
};

const SessionTable = ({ rows }: { rows: AffiliateSessionEvent[] }) => {
  if (!rows.length) return <EmptyState label="No session events found." />;

  return (
    <DataTable>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead>Created at</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>IP address</TableHead>
          <TableHead>Session ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDateTime(row.created_at)}</TableCell>
            <TableCell>{getText(row.device_type)}</TableCell>
            <TableCell>
              {[row.city, row.country].filter(Boolean).join(", ") || "-"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {getText(row.ip_address)}
            </TableCell>
            <TableCell className="font-mono text-xs">{row.id}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
};

const OrderTable = ({
  rows,
  canOpenCheckout,
  locale,
}: {
  rows: AffiliateOrderEvent[];
  canOpenCheckout: boolean;
  locale: string;
}) => {
  if (!rows.length) return <EmptyState label="No order events found." />;

  return (
    <DataTable>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead>Created at</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Checkout ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDateTime(row.created_at)}</TableCell>
            <TableCell>
              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatMoney(row.total_amount)}
            </TableCell>
            <TableCell>{getText(row.device_type)}</TableCell>
            <TableCell>{getText(row.country)}</TableCell>
            <TableCell className="font-mono text-xs">
              {canOpenCheckout && row.id_1 ? (
                <a
                  href={`/${locale}/admin/orders/${row.id_1}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-secondary underline-offset-4 hover:underline"
                >
                  {getText(row.checkout_code)}
                </a>
              ) : (
                getText(row.checkout_code)
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
};

const ConversionTable = ({ rows }: { rows: AffiliateConversionEvent[] }) => {
  if (!rows.length) {
    return <EmptyState label="No conversion events found." />;
  }

  return (
    <DataTable>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead>Created at</TableHead>
          <TableHead>Landing page</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Commission</TableHead>
          <TableHead className="text-right">Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDateTime(row.created_at)}</TableCell>
            <TableCell className="max-w-[520px] truncate">
              {getText(row.landing_page)}
            </TableCell>
            <TableCell
              className={`text-right font-semibold ${
                row.revenue_amount < 0 ? "text-red-600" : "text-slate-950"
              }`}
            >
              {formatMoney(row.revenue_amount)}
            </TableCell>
            <TableCell className="text-right font-semibold text-secondary">
              {formatMoney(row.commission_amount)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {row.commission_rate}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
};

const DataTable = ({ children }: { children: ReactNode }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="max-h-[620px] overflow-auto">
        <Table>{children}</Table>
      </div>
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
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-[4.25rem] justify-between rounded-2xl border-secondary/20 bg-white px-4 text-left shadow-sm hover:bg-secondary/10 hover:text-secondary"
          >
            <span className="text-lg font-semibold text-slate-950">
              {formatDateLabel(date)}
            </span>
            <span className="rounded-xl bg-secondary/10 p-2 text-secondary">
              <CalendarIcon className="size-5" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-3xl border-secondary/20 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
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

const TableSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
      {label}
    </div>
  );
};

export default AffiliateEventsPage;
