"use client";

import React from "react";
import Image from "next/image";
import { useGetProductsCheckOutDashboard } from "@/features/checkout/hook";
import { useGetAllProductAndSold } from "@/features/products/hook";
import { getAllProductAndSold } from "@/features/products/api";
import { ProductAndSoldItem } from "@/types/products";
import { ProviderItem } from "@/types/checkout";
import { format, getISOWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useDebounce } from "use-debounce";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STOCK_PAGE_SIZE = 20;
type SoldStockSort = "asc" | "desc";

type IncomingDisplayItem = {
  id: string;
  quantity: number;
  date: Date;
};

type InventorySource = {
  inventory_pos?: ProductAndSoldItem["inventory_pos"] | null;
  inventories_po?: ProductAndSoldItem["inventory_pos"] | null;
  inventory_po?: ProductAndSoldItem["inventory_pos"] | null;
};

type RevenueSortValue = "none" | "asc" | "desc";
type RevenueCustomerType = "all" | "b2b" | "b2c";
type EconeloFilterValue = "all" | "true" | "false";

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getMainImageUrl = (item: ProviderItem) =>
  (item.static_files ?? []).find((file) => (file?.url ?? "").trim())?.url ?? "";

const getIncomingStockExportValue = (product: ProductAndSoldItem): string => {
  const incomingItems = getIncomingDisplayItems(product);
  if (incomingItems.length === 0) return "—";

  return incomingItems
    .map((item) => {
      const date = item.date;
      const formattedDate =
        date && !Number.isNaN(date.getTime())
          ? `CW ${String(getISOWeek(date)).padStart(2, "0")} - ${format(date, "MMMM d")}`
          : "—";

      return `${item.quantity ?? 0} | ${formattedDate}`;
    })
    .join(" ; ");
};

const toApiDateTime = (value: string) => {
  if (!value) return undefined;
  const normalized = value.trim();
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;
  const withSeconds =
    normalized.length === 16 ? `${normalized}:00` : normalized;
  return withSeconds.replace(/Z$/, "");
};

const getSoldStockValue = (product: ProductAndSoldItem): number | null => {
  const rawValue = product.sold;

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  return toNumber(rawValue);
};

const getMinStockValue = (product: ProductAndSoldItem): number | null => {
  const rawValue = product.min_stock;
  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  return toNumber(rawValue);
};

const getIncomingDisplayItems = (
  product: ProductAndSoldItem,
): IncomingDisplayItem[] => {
  const now = new Date();

  const getInventoryItems = (source?: InventorySource) =>
    source?.inventory_pos ??
    source?.inventories_po ??
    source?.inventory_po ??
    [];

  const buildFutureIncomingRows = (
    inventoryItems: ProductAndSoldItem["inventory_pos"] | undefined,
  ) =>
    (inventoryItems ?? [])
      .map((item) => {
        if ((item.quantity ?? 0) <= 0) return null;
        if (!item.list_delivery_date) return null;

        const date = new Date(item.list_delivery_date);
        if (Number.isNaN(date.getTime())) return null;
        // Delivery date is considered incoming until end of that day.
        date.setHours(23, 59, 59, 999);
        if (date < now) return null;

        return {
          id: item.id,
          quantity: item.quantity ?? 0,
          date,
        };
      })
      .filter((item): item is IncomingDisplayItem => item !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  const isBundleProduct = (product.bundles?.length ?? 0) > 0;
  if (isBundleProduct) {
    const bundleStates = (product.bundles ?? [])
      .map((bundle) => {
        const quantityPerBundle = Number(bundle?.quantity ?? 0);
        if (quantityPerBundle <= 0 || !bundle?.bundle_item) return null;

        const incomingByDate = new Map<number, number>();
        for (const entry of buildFutureIncomingRows(
          getInventoryItems(bundle.bundle_item),
        )) {
          const timestamp = entry.date.getTime();
          incomingByDate.set(
            timestamp,
            (incomingByDate.get(timestamp) ?? 0) + (entry.quantity ?? 0),
          );
        }

        return { quantityPerBundle, incomingByDate };
      })
      .filter(
        (
          state,
        ): state is {
          quantityPerBundle: number;
          incomingByDate: Map<number, number>;
        } => state !== null,
      );

    if (bundleStates.length === 0) return [];

    const allDates = Array.from(
      new Set(
        bundleStates.flatMap((state) =>
          Array.from(state.incomingByDate.keys()),
        ),
      ),
    ).sort((a, b) => a - b);

    if (allDates.length === 0) return [];

    const cumulativeByBundle = bundleStates.map(() => 0);
    let previousParentTotal = 0;
    const bundleRows: IncomingDisplayItem[] = [];
    const parentKey = String(product.id ?? product.id_provider ?? "product");

    for (const timestamp of allDates) {
      bundleStates.forEach((state, index) => {
        cumulativeByBundle[index] += state.incomingByDate.get(timestamp) ?? 0;
      });

      const parentTotalAtDate = Math.max(
        0,
        Math.min(
          ...bundleStates.map((state, index) =>
            Math.floor(cumulativeByBundle[index] / state.quantityPerBundle),
          ),
        ),
      );

      const parentDelta = parentTotalAtDate - previousParentTotal;
      if (parentDelta > 0) {
        bundleRows.push({
          id: `bundle-${parentKey}-${timestamp}`,
          quantity: parentDelta,
          date: new Date(timestamp),
        });
      }

      previousParentTotal = parentTotalAtDate;
    }

    return bundleRows;
  }

  return buildFutureIncomingRows(getInventoryItems(product));
};

function IncomingStockDisplay({ product }: { product: ProductAndSoldItem }) {
  const today = React.useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);
  const incomingItems = React.useMemo(
    () => getIncomingDisplayItems(product),
    [product],
  );

  if (!incomingItems.length) {
    return <div className="text-center">—</div>;
  }

  return (
    <div className="space-y-1.5 text-sm text-center">
      {incomingItems.map((item) => {
        const date = item.date;
        const formattedDate =
          date && !Number.isNaN(date.getTime())
            ? `CW ${String(getISOWeek(date)).padStart(2, "0")} - ${format(date, "MMMM d")}`
            : "—";

        const sixWeeksFromNow = new Date(today);
        sixWeeksFromNow.setDate(sixWeeksFromNow.getDate() + 42);
        const isSoon =
          date &&
          !Number.isNaN(date.getTime()) &&
          date > today &&
          date <= sixWeeksFromNow;

        return (
          <div key={item.id} className={isSoon ? "text-secondary" : undefined}>
            {item.quantity ?? 0} | {formattedDate ?? "—"}
          </div>
        );
      })}
    </div>
  );
}

export default function ProductAnalyticsPage() {
  const [stockPage, setStockPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerms, setSearchTerms] = React.useState<string[]>([]);
  const [soldStockSort, setSoldStockSort] =
    React.useState<SoldStockSort>("desc");
  const [isExportingStockExcel, setIsExportingStockExcel] =
    React.useState(false);
  const [isEconeloFilter, setIsEconeloFilter] =
    React.useState<EconeloFilterValue>("all");
  const [revenueFromDate, setRevenueFromDate] = React.useState("");
  const [revenueToDate, setRevenueToDate] = React.useState("");
  const [revenueCustomerType, setRevenueCustomerType] =
    React.useState<RevenueCustomerType>("all");
  const [sortByQuantity, setSortByQuantity] =
    React.useState<RevenueSortValue>("none");
  const [sortByRevenue, setSortByRevenue] =
    React.useState<RevenueSortValue>("desc");
  const [debouncedRevenueFromDate] = useDebounce(revenueFromDate, 450);
  const [debouncedRevenueToDate] = useDebounce(revenueToDate, 450);

  const parseSearchTerms = React.useCallback((value: string) => {
    return value
      .split(/[,\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }, []);

  const commitSearchInput = React.useCallback(() => {
    const nextTerms = parseSearchTerms(searchInput);
    if (nextTerms.length === 0) return;

    setSearchTerms((prev) => {
      const merged = new Set([...prev, ...nextTerms]);
      return Array.from(merged);
    });
    setSearchInput("");
  }, [parseSearchTerms, searchInput]);

  const removeSearchTerm = React.useCallback((targetTerm: string) => {
    setSearchTerms((prev) => prev.filter((term) => term !== targetTerm));
  }, []);

  const normalizedSearchTerms = React.useMemo(
    () =>
      Array.from(
        new Set(
          searchTerms
            .map((term) => term.trim())
            .filter((term) => term.length > 0),
        ),
      ),
    [searchTerms],
  );

  const stockSearchParam = React.useMemo(() => {
    if (normalizedSearchTerms.length === 0) return undefined;
    return normalizedSearchTerms;
  }, [normalizedSearchTerms]);

  const stockIsEconeloParam = React.useMemo<boolean | undefined>(() => {
    if (isEconeloFilter === "all") return undefined;
    return isEconeloFilter === "true";
  }, [isEconeloFilter]);

  const stockQueryParams = React.useMemo(
    () => ({
      ...(stockSearchParam ? { search: stockSearchParam } : {}),
      ...(stockIsEconeloParam !== undefined
        ? { is_econelo: stockIsEconeloParam }
        : {}),
      sort_by_stock: soldStockSort,
    }),
    [stockSearchParam, stockIsEconeloParam, soldStockSort],
  );

  React.useEffect(() => {
    setStockPage(1);
  }, [stockSearchParam, soldStockSort, stockIsEconeloParam]);

  const {
    data: productsData,
    isLoading: isStockLoading,
    isFetching: isStockFetching,
    isError: isStockError,
  } = useGetAllProductAndSold({
    page: stockPage,
    page_size: STOCK_PAGE_SIZE,
    ...stockQueryParams,
  });

  const handleExportStockExcel = React.useCallback(async () => {
    setIsExportingStockExcel(true);

    try {
      const firstPage = await getAllProductAndSold({
        ...stockQueryParams,
        page: 1,
        page_size: STOCK_PAGE_SIZE,
      });

      const totalPagesForExport = Math.max(
        1,
        firstPage?.pagination?.total_pages ?? 1,
      );

      const exportItems: ProductAndSoldItem[] = [...(firstPage?.items ?? [])];

      if (totalPagesForExport > 1) {
        const pageRequests = Array.from(
          { length: totalPagesForExport - 1 },
          (_, index) =>
            getAllProductAndSold({
              ...stockQueryParams,
              page: index + 2,
              page_size: STOCK_PAGE_SIZE,
            }),
        );

        const pageResponses = await Promise.all(pageRequests);
        pageResponses.forEach((response) => {
          exportItems.push(...(response?.items ?? []));
        });
      }

      const exportRows = exportItems.map((product) => ({
        "Product ID": String(product.id_provider ?? "-"),
        Name: product.name?.trim() || "-",
        "Physical stock": toNumber(product.stock),
        "Reserved stock": toNumber(product.result_stock),
        "Available stock": toNumber(
          (product.stock ?? 0) - (product.result_stock ?? 0),
        ),
        "Units sold": getSoldStockValue(product) ?? "",
        "Incoming stock": getIncomingStockExportValue(product),
        "Min stock": getMinStockValue(product) ?? "",
      }));

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Overview");

      const timestamp = format(new Date(), "yyyyMMdd-HHmm");
      XLSX.writeFile(workbook, `stock-overview-${timestamp}.xlsx`);
      toast.success(`Exported ${exportRows.length} rows`);
    } catch {
      toast.error("Failed to export stock excel");
    } finally {
      setIsExportingStockExcel(false);
    }
  }, [stockQueryParams]);

  const revenueQueryParams = React.useMemo(() => {
    const fromDate = toApiDateTime(debouncedRevenueFromDate);
    const toDate = toApiDateTime(debouncedRevenueToDate);

    return {
      ...(fromDate ? { from_date: fromDate } : {}),
      ...(toDate ? { to_date: toDate } : {}),
      ...(revenueCustomerType !== "all"
        ? { is_b2b: revenueCustomerType === "b2b" }
        : {}),
      ...(sortByQuantity !== "none"
        ? { sort_by_quantity: sortByQuantity }
        : {}),
      ...(sortByRevenue !== "none" ? { sort_by_revenue: sortByRevenue } : {}),
    };
  }, [
    debouncedRevenueFromDate,
    debouncedRevenueToDate,
    revenueCustomerType,
    sortByQuantity,
    sortByRevenue,
  ]);

  const {
    data: providerOverview,
    isLoading: isRevenueLoading,
    isError: isRevenueError,
  } = useGetProductsCheckOutDashboard(revenueQueryParams);

  const topRevenueProducts = React.useMemo(
    () => providerOverview?.items ?? [],
    [providerOverview?.items],
  );

  const totalPages = productsData?.pagination.total_pages ?? 1;
  const totalItems = productsData?.pagination.total_items ?? 0;
  const stockItems = productsData?.items ?? [];
  const shouldShowStockSkeleton =
    isStockLoading || (isStockFetching && !isStockError);
  const soldStockSortLabel =
    soldStockSort === "asc"
      ? "Physical stock: low to high"
      : "Physical stock: high to low";
  return (
    <div className="pb-6">
      <div className="flex flex-col gap-6">
        <div className="section-header">Products Analytics</div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-base">Stock Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Physical, sold, incoming and min stock by product.
              </p>
            </CardHeader>
            <CardContent className="min-h-0 space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border border-secondary/15 bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:max-w-2xl">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault();
                          commitSearchInput();
                          return;
                        }

                        if (
                          event.key === "Backspace" &&
                          !searchInput.trim() &&
                          normalizedSearchTerms.length > 0
                        ) {
                          event.preventDefault();
                          setSearchTerms((prev) => prev.slice(0, -1));
                        }
                      }}
                      placeholder="Type keyword and press Enter (multiple search)"
                      className="h-10 border-secondary/20 bg-white pl-9 pr-9"
                    />
                    {searchInput ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        onClick={() => setSearchInput("")}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ) : null}
                  </div>

                  {normalizedSearchTerms.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {normalizedSearchTerms.map((term) => (
                        <Badge
                          key={term}
                          className="flex items-center gap-1.5 bg-secondary/90 text-white hover:bg-secondary/60"
                        >
                          <span>{term}</span>
                          <button
                            type="button"
                            className="inline-flex text-white/80 hover:text-white"
                            onClick={() => removeSearchTerm(term)}
                            aria-label={`Remove ${term}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setSearchTerms([])}
                      >
                        Clear all
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                  <Select
                    value={isEconeloFilter}
                    onValueChange={(value: EconeloFilterValue) =>
                      setIsEconeloFilter(value)
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-md border border-secondary/40 bg-white shadow-sm transition-colors hover:border-secondary/60 focus:ring-2 focus:ring-secondary/30 md:w-[210px]">
                      <SelectValue placeholder="Filter by brand scope" />
                    </SelectTrigger>
                    <SelectContent className="border border-secondary/30">
                      <SelectItem value="all">All products</SelectItem>
                      <SelectItem value="true">Econelo only</SelectItem>
                      <SelectItem value="false">Non-Econelo only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full border-secondary/25 bg-white md:w-auto"
                    onClick={() =>
                      setSoldStockSort((prev) =>
                        prev === "desc" ? "asc" : "desc",
                      )
                    }
                  >
                    {soldStockSort === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : soldStockSort === "desc" ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                    {soldStockSortLabel}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full border-secondary/25 bg-white md:w-auto"
                    disabled={shouldShowStockSkeleton || isExportingStockExcel}
                    onClick={() => {
                      void handleExportStockExcel();
                    }}
                  >
                    {isExportingStockExcel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Export Excel
                  </Button>
                </div>
              </div>

              {shouldShowStockSkeleton ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Updating stock data...
                  </div>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full" />
                  ))}
                </div>
              ) : isStockError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  Could not load stock data.
                </div>
              ) : (
                <>
                  <div className="max-h-[62vh] overflow-y-auto rounded-xl border">
                    <Table className="text-sm">
                      <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-11 px-3">
                            Product ID
                          </TableHead>
                          <TableHead className="h-11 px-3">Name</TableHead>
                          <TableHead className="h-11 px-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              className="ml-auto h-auto px-0 text-right font-medium hover:bg-transparent"
                              onClick={() =>
                                setSoldStockSort((prev) =>
                                  prev === "desc" ? "asc" : "desc",
                                )
                              }
                            >
                              Physical stock
                              {soldStockSort === "asc" ? (
                                <ArrowUp className="ml-1 h-3.5 w-3.5" />
                              ) : soldStockSort === "desc" ? (
                                <ArrowDown className="ml-1 h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="h-11 px-3 text-right">
                            Reserved stock
                          </TableHead>
                          <TableHead className="h-11 px-3 text-right">
                            Available stock
                          </TableHead>

                          <TableHead className="h-11 px-3 text-right">
                            Units sold
                          </TableHead>
                          <TableHead className="h-11 px-3">
                            Incoming stock
                          </TableHead>
                          <TableHead className="h-11 px-3 text-right">
                            Min stock
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockItems.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No products found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          stockItems.map((product) => {
                            const productId = String(
                              product.id_provider ?? "-",
                            );
                            const soldStock = getSoldStockValue(product);
                            const minStock = getMinStockValue(product);

                            return (
                              <TableRow key={String(product.id ?? productId)}>
                                <TableCell className="px-3 font-medium">
                                  {productId || "-"}
                                </TableCell>
                                <TableCell className="max-w-[420px] px-3 whitespace-normal">
                                  {product.name?.trim() || "-"}
                                </TableCell>
                                <TableCell className="px-3 text-right">
                                  {toNumber(product.stock).toLocaleString(
                                    "de-DE",
                                  )}
                                </TableCell>
                                <TableCell className="px-3 text-right">
                                  {toNumber(
                                    product.result_stock,
                                  ).toLocaleString("de-DE")}
                                </TableCell>
                                <TableCell className="px-3 text-right">
                                  {toNumber(
                                    (product.stock ?? 0) -
                                      (product.result_stock ?? 0),
                                  ).toLocaleString("de-DE")}
                                </TableCell>

                                <TableCell className="px-3 text-right">
                                  {soldStock === null
                                    ? "-"
                                    : soldStock.toLocaleString("de-DE")}
                                </TableCell>
                                <TableCell className="px-3">
                                  <IncomingStockDisplay product={product} />
                                </TableCell>
                                <TableCell className="px-3 text-right">
                                  {minStock === null
                                    ? "-"
                                    : minStock.toLocaleString("de-DE")}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <CustomPagination
                    page={stockPage}
                    totalPages={Math.max(1, totalPages)}
                    totalItems={totalItems}
                    onPageChange={setStockPage}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-base">Top Revenue Products</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranked by gross revenue (dashboard source).
              </p>
            </CardHeader>
            <CardContent className="min-h-0">
              <div className="mb-4 rounded-xl border border-secondary/15 bg-muted/20 p-2.5">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <Input
                    type="datetime-local"
                    value={revenueFromDate}
                    onChange={(event) => setRevenueFromDate(event.target.value)}
                    className="h-9 border bg-white text-sm"
                  />
                  <Input
                    type="datetime-local"
                    value={revenueToDate}
                    onChange={(event) => setRevenueToDate(event.target.value)}
                    className="h-9 border bg-white text-sm"
                  />

                  <Select
                    value={revenueCustomerType}
                    onValueChange={(value: RevenueCustomerType) =>
                      setRevenueCustomerType(value)
                    }
                  >
                    <SelectTrigger className="h-9 border bg-white text-sm">
                      <SelectValue placeholder="Customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All customers</SelectItem>
                      <SelectItem value="b2b">B2B only</SelectItem>
                      <SelectItem value="b2c">B2C only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortByQuantity}
                    onValueChange={(value: RevenueSortValue) =>
                      setSortByQuantity(value)
                    }
                  >
                    <SelectTrigger className="h-9 border bg-white text-sm">
                      <SelectValue placeholder="Sort by quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Quantity: default</SelectItem>
                      <SelectItem value="desc">
                        Quantity: high to low
                      </SelectItem>
                      <SelectItem value="asc">Quantity: low to high</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortByRevenue}
                    onValueChange={(value: RevenueSortValue) =>
                      setSortByRevenue(value)
                    }
                  >
                    <SelectTrigger className="h-9 border bg-white text-sm">
                      <SelectValue placeholder="Sort by revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Revenue: default</SelectItem>
                      <SelectItem value="desc">Revenue: high to low</SelectItem>
                      <SelectItem value="asc">Revenue: low to high</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full text-sm xl:w-auto"
                    onClick={() => {
                      setRevenueFromDate("");
                      setRevenueToDate("");
                      setRevenueCustomerType("all");
                      setSortByQuantity("none");
                      setSortByRevenue("desc");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </div>

              {isRevenueLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full" />
                  ))}
                </div>
              ) : isRevenueError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  Could not load top revenue data.
                </div>
              ) : (
                <div className="max-h-[46vh] overflow-y-auto rounded-xl border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-11 px-3">#</TableHead>
                        <TableHead className="h-11 px-3">Product</TableHead>
                        <TableHead className="h-11 px-3 text-right">
                          Sold qty
                        </TableHead>
                        <TableHead className="h-11 px-3 text-right">
                          Revenue
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topRevenueProducts.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No revenue data available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        topRevenueProducts.map((item, index) => {
                          const imageUrl = getMainImageUrl(item);

                          return (
                            <TableRow key={`${item.id_provider}-${index}`}>
                              <TableCell className="px-3 font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell className="px-3">
                                <div className="flex items-start gap-3">
                                  <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                                    {imageUrl ? (
                                      <Image
                                        src={imageUrl}
                                        alt={
                                          item.product_name ?? item.id_provider
                                        }
                                        className="size-full object-cover"
                                        width={48}
                                        height={48}
                                      />
                                    ) : null}
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <div className="line-clamp-2 font-medium">
                                      {item.product_name?.trim() || "-"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      ID: {item.id_provider || "-"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 text-right">
                                {toNumber(item.total_quantity).toLocaleString(
                                  "de-DE",
                                )}
                              </TableCell>
                              <TableCell className="px-3 text-right font-semibold">
                                {formatCurrency(toNumber(item.total_amount))}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
