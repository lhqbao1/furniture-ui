"use client";

import React from "react";
import { useGetProductsCheckOutDashboard } from "@/features/checkout/hook";
import { useGetAllProductAndSold } from "@/features/products/hook";
import { ProductAndSoldItem } from "@/types/products";
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
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { useDebounce } from "use-debounce";

const STOCK_PAGE_SIZE = 20;
type SoldStockSort = "asc" | "desc";

type IncomingDisplayItem = {
  id: string;
  quantity: number;
  date: Date;
};

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getSoldStockValue = (product: ProductAndSoldItem): number | null => {
  const rawValue = product.sold;

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  return toNumber(rawValue);
};

const getMinStockValue = (product: ProductAndSoldItem): number | null => {
  const rawValue = product.min_stock;
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  return toNumber(rawValue);
};

const getIncomingDisplayItems = (
  product: ProductAndSoldItem,
): IncomingDisplayItem[] => {
  const now = new Date();

  const buildFutureIncomingRows = (
    inventoryPos: ProductAndSoldItem["inventory_pos"] | undefined,
  ) =>
    (inventoryPos ?? [])
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
          bundle.bundle_item.inventory_pos,
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
        bundleStates.flatMap((state) => Array.from(state.incomingByDate.keys())),
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

  return buildFutureIncomingRows(product.inventory_pos);
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
          <div
            key={item.id}
            className={isSoon ? "text-secondary" : undefined}
          >
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
  const [soldStockSort, setSoldStockSort] =
    React.useState<SoldStockSort>("desc");
  const [debouncedSearch] = useDebounce(searchInput.trim(), 450);

  React.useEffect(() => {
    setStockPage(1);
  }, [debouncedSearch, soldStockSort]);

  const {
    data: productsData,
    isLoading: isStockLoading,
    isError: isStockError,
  } = useGetAllProductAndSold({
    page: stockPage,
    page_size: STOCK_PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sort_by_stock: soldStockSort,
  });

  const {
    data: providerOverview,
    isLoading: isRevenueLoading,
    isError: isRevenueError,
  } = useGetProductsCheckOutDashboard();

  const topRevenueProducts = React.useMemo(
    () =>
      [...(providerOverview?.items ?? [])]
        .sort((a, b) => toNumber(b.total_amount) - toNumber(a.total_amount))
        .slice(0, 20),
    [providerOverview?.items],
  );

  const totalPages = productsData?.pagination.total_pages ?? 1;
  const totalItems = productsData?.pagination.total_items ?? 0;
  const stockItems = productsData?.items ?? [];
  const soldStockSortLabel =
    soldStockSort === "asc"
      ? "Sold stock: low to high"
      : "Sold stock: high to low";

  return (
    <div className="h-screen overflow-hidden pb-6">
      <div className="flex h-full flex-col gap-6">
        <div className="section-header">Products Analytics</div>

        <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3 min-h-0">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-base">Stock Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Physical, sold, incoming and min stock by product.
              </p>
            </CardHeader>
            <CardContent className="min-h-0 space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border border-secondary/15 bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by product id or name..."
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

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full border-secondary/25 bg-white md:w-auto"
                  onClick={() =>
                    setSoldStockSort((prev) => (prev === "desc" ? "asc" : "desc"))
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
              </div>

              {isStockLoading ? (
                <div className="space-y-2">
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
                          <TableHead className="h-11 px-3">Product ID</TableHead>
                          <TableHead className="h-11 px-3">Name</TableHead>
                          <TableHead className="h-11 px-3 text-right">
                            Physical stock
                          </TableHead>
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
                              Sold stock
                              {soldStockSort === "asc" ? (
                                <ArrowUp className="ml-1 h-3.5 w-3.5" />
                              ) : soldStockSort === "desc" ? (
                                <ArrowDown className="ml-1 h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="h-11 px-3">Incoming stock</TableHead>
                          <TableHead className="h-11 px-3 text-right">
                            Min stock
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockItems.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No products found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          stockItems.map((product) => {
                            const productId = String(product.id_provider ?? "-");
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
                                  {toNumber(product.stock).toLocaleString("de-DE")}
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

          <Card className="xl:col-span-2 min-h-0">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-base">Top Revenue Products</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranked by gross revenue (dashboard source).
              </p>
            </CardHeader>
            <CardContent className="min-h-0">
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
                <div className="max-h-[73vh] overflow-y-auto rounded-xl border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-11 px-3">#</TableHead>
                        <TableHead className="h-11 px-3">Product ID</TableHead>
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
                        topRevenueProducts.map((item, index) => (
                          <TableRow key={`${item.id_provider}-${index}`}>
                            <TableCell className="px-3 font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="px-3">
                              {item.id_provider || "-"}
                            </TableCell>
                            <TableCell className="px-3 text-right">
                              {toNumber(item.total_quantity).toLocaleString("de-DE")}
                            </TableCell>
                            <TableCell className="px-3 text-right font-semibold">
                              {formatCurrency(toNumber(item.total_amount))}
                            </TableCell>
                          </TableRow>
                        ))
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
