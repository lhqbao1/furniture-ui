"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilterForm from "./toolbar/filter";
import ImportDialog from "./toolbar/import";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import OrderFilterForm from "../../orders/order-list/filter/filter-form";
import { useSearchParams } from "next/navigation";
import FilterExportForm from "./toolbar/filter-export-dialog";
import { cn } from "@/lib/utils";
import UpdateStatusDialog from "./toolbar/bulk-update/status-dialog";
import ExportSelectedProductsDialog from "./toolbar/bulk-update/export-selected";
import EANDrawer from "./toolbar/bulk-update/ean-drawer";
import MultiSearch from "./toolbar/multi-search";
import { useGetSuppliers } from "@/features/supplier/hook";
import { useGetBrands } from "@/features/brand/hook";
import { useGetCategories } from "@/features/category/hook";
import { flattenCategoryOptions } from "./toolbar/filter/category/category-options";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface TableToolbarProps {
  searchQuery?: string;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  exportData?: ProductItem[];
  type: ToolbarType;
  product_ids?: string[];
  selectedProducts?: ProductItem[];
  columnOptions?: { id: string; label: string; alwaysVisible?: boolean }[];
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  isDSP?: boolean;
}

type ImageFile = {
  url: string;
};

const FILTER_KEYS = [
  "search",
  "multi_search",
  "all_products",
  "supplier_id",
  "brand_id",
  "category_id",
  "sort_by_stock",
  "sort_by_incoming_stock",
  "sort_by_marketplace",
  "is_inventory",
];

export default function TableToolbar({
  searchQuery,
  pageSize,
  setPageSize,
  setPage,
  setSearchQuery,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  exportData,
  type,
  product_ids,
  selectedProducts,
  columnOptions,
  columnVisibility,
  onColumnVisibilityChange,
  isDSP = false,
}: TableToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasShownSpaceToast, setHasShownSpaceToast] = useState(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [openExportSelected, setOpenExportSelected] = useState(false);
  // const [openEanDrawer, setOpenEanDrawer] = useState(false);

  const pathname = usePathname();
  const defaultSearch = searchParams.get("search") ?? "";
  const { data: suppliers } = useGetSuppliers(type === ToolbarType.product);
  const { data: brands } = useGetBrands();
  const { data: categories } = useGetCategories();

  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [prevParams, setPrevParams] = useState(
    Object.fromEntries(searchParams.entries()),
  );

  const parseCsvParam = React.useCallback(
    (value: string | null) =>
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [],
  );

  const pushWithParams = React.useCallback(
    (params: URLSearchParams) => {
      router.push(
        {
          pathname,
          query: {
            ...Object.fromEntries(params.entries()),
            page: 1,
          },
        },
        { scroll: false },
      );
      setPage(1);
    },
    [pathname, router, setPage],
  );

  const removeFilterParam = React.useCallback(
    (paramKey: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramKey);
      pushWithParams(params);
    },
    [pushWithParams, searchParams],
  );

  const removeFilterValue = React.useCallback(
    (paramKey: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = parseCsvParam(params.get(paramKey));
      const nextValues = currentValues.filter((item) => item !== value);

      if (nextValues.length === 0) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, nextValues.join(","));
      }

      pushWithParams(params);
    },
    [parseCsvParam, pushWithParams, searchParams],
  );

  const resetAllFilters = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((key) => params.delete(key));
    pushWithParams(params);
    setSearchValue("");
  }, [pushWithParams, searchParams]);

  const applySearch = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedSearch = searchValue.trim();

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    } else {
      params.delete("search");
    }

    pushWithParams(params);
    setSearchQuery?.(normalizedSearch);
  }, [pushWithParams, searchParams, searchValue, setSearchQuery]);

  const supplierLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    map.set("prestige_home", "Prestige Home");
    (suppliers ?? []).forEach((supplier) => {
      map.set(supplier.id, supplier.business_name);
    });
    return map;
  }, [suppliers]);

  const brandLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (brands ?? []).forEach((brand) => {
      map.set(brand.id, brand.name);
    });
    return map;
  }, [brands]);

  const categoryLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    flattenCategoryOptions(categories ?? []).forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  const activeFilterChips = React.useMemo(() => {
    type FilterChip = {
      id: string;
      label: string;
      onRemove: () => void;
    };

    const chips: FilterChip[] = [];

    const search = (searchParams.get("search") ?? "").trim();
    if (search) {
      chips.push({
        id: "search",
        label: `Search: ${search}`,
        onRemove: () => {
          setSearchValue("");
          removeFilterParam("search");
        },
      });
    }

    const multiSearchValues = parseCsvParam(searchParams.get("multi_search"));
    multiSearchValues.forEach((value) => {
      chips.push({
        id: `multi-search-${value}`,
        label: `Multiple: ${value}`,
        onRemove: () => removeFilterValue("multi_search", value),
      });
    });

    const allProducts = searchParams.get("all_products");
    if (allProducts === "true" || allProducts === "false") {
      chips.push({
        id: "all-products",
        label: `Status: ${allProducts === "true" ? "Active only" : "Inactive"}`,
        onRemove: () => removeFilterParam("all_products"),
      });
    }

    const supplierId = searchParams.get("supplier_id");
    if (supplierId) {
      chips.push({
        id: "supplier",
        label: `Supplier: ${supplierLabelMap.get(supplierId) ?? supplierId}`,
        onRemove: () => removeFilterParam("supplier_id"),
      });
    }

    const brandId = searchParams.get("brand_id");
    if (brandId) {
      chips.push({
        id: "brand",
        label: `Brand: ${brandLabelMap.get(brandId) ?? brandId}`,
        onRemove: () => removeFilterParam("brand_id"),
      });
    }

    const categoryId = searchParams.get("category_id");
    if (categoryId) {
      chips.push({
        id: "category",
        label: `Category: ${categoryLabelMap.get(categoryId) ?? categoryId}`,
        onRemove: () => removeFilterParam("category_id"),
      });
    }

    const stockSort = searchParams.get("sort_by_stock");
    if (stockSort === "asc" || stockSort === "desc") {
      chips.push({
        id: "sort-by-stock",
        label: `Stock sort: ${stockSort === "asc" ? "Ascending" : "Descending"}`,
        onRemove: () => removeFilterParam("sort_by_stock"),
      });
    }

    const incomingStockSort = searchParams.get("sort_by_incoming_stock");
    if (incomingStockSort === "asc" || incomingStockSort === "desc") {
      chips.push({
        id: "sort-by-incoming-stock",
        label: `Incoming stock sort: ${incomingStockSort === "asc" ? "Ascending" : "Descending"}`,
        onRemove: () => removeFilterParam("sort_by_incoming_stock"),
      });
    }

    const marketplaceSort = searchParams.get("sort_by_marketplace");
    if (marketplaceSort === "asc" || marketplaceSort === "desc") {
      chips.push({
        id: "sort-by-marketplace",
        label: `Marketplace sort: ${marketplaceSort === "asc" ? "Ascending" : "Descending"}`,
        onRemove: () => removeFilterParam("sort_by_marketplace"),
      });
    }

    const isInventory = searchParams.get("is_inventory");
    if (isInventory === "true" || isInventory === "false") {
      chips.push({
        id: "inventory",
        label: `Inventory: ${isInventory === "true" ? "In stock only" : "Out of stock only"}`,
        onRemove: () => removeFilterParam("is_inventory"),
      });
    }

    return chips;
  }, [
    brandLabelMap,
    categoryLabelMap,
    parseCsvParam,
    removeFilterParam,
    removeFilterValue,
    searchParams,
    supplierLabelMap,
  ]);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    const current = Object.fromEntries(searchParams.entries());

    const filterChanged = FILTER_KEYS.some((k) => current[k] !== prevParams[k]);

    if (filterChanged) {
      router.push(
        {
          pathname,
          query: { ...current, page: 1 },
        },
        { scroll: false },
      );
      setPage(1);
    }

    setPrevParams(current);
  }, [searchParams]);

  return (
    <div className="w-full rounded-2xl border border-secondary/15 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex w-full flex-1 items-center gap-2 rounded-xl border border-secondary/10 bg-muted/20 p-1.5">
            <MultiSearch />
            <Input
              placeholder="Search (press Enter)"
              className={cn(
                "h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                searchValue.includes(" ") &&
                  "border-yellow-400 focus-visible:ring-yellow-400",
              )}
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;

                if (value.includes(" ")) {
                  if (!hasShownSpaceToast) {
                    toast.warning(
                      "Your search contains spaces. Please check your keyword.",
                    );
                    setHasShownSpaceToast(true);
                  }
                } else {
                  setHasShownSpaceToast(false);
                }

                setSearchValue(value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void applySearch();
                }
              }}
            />
          </div>

          <div
            className={cn(
              "grid w-full gap-2 rounded-xl border border-secondary/10 bg-muted/20 p-1.5 md:ml-auto md:w-fit",
              columnOptions?.length
                ? "grid-cols-3 md:grid-cols-[120px_120px_120px]"
                : "grid-cols-2 sm:grid-cols-4 md:grid-cols-[120px_120px_120px_120px]",
            )}
          >
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer border bg-white text-black">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 rows</SelectItem>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="200">200 rows</SelectItem>
                <SelectItem value="300">300 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
                <SelectItem value="2000">2000 rows</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex h-10 w-full items-center gap-1 bg-secondary px-2 text-white hover:bg-secondary/90"
                >
                  Filter <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[95vw] max-w-[920px] p-4 md:p-6">
                {type === ToolbarType.product && <FilterForm isDSP={isDSP} />}
                {type === ToolbarType.order && <OrderFilterForm />}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-10 w-full items-center gap-1 bg-white px-2 hover:bg-white/90"
                >
                  View <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {columnOptions && columnOptions.length > 0 ? (
                  <>
                    <DropdownMenuLabel>Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columnOptions.map((column) => {
                      const checked = columnVisibility?.[column.id] ?? true;
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={checked}
                          disabled={column.alwaysVisible}
                          onCheckedChange={(value) => {
                            onColumnVisibilityChange?.(
                              column.id,
                              Boolean(value),
                            );
                          }}
                        >
                          {column.label}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>Compact</DropdownMenuItem>
                    <DropdownMenuItem>Comfortable</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {!columnOptions?.length && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex h-10 w-full items-center gap-1 bg-white px-2 hover:bg-white/90"
                  >
                    Columns <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Name</DropdownMenuItem>
                  <DropdownMenuItem>Stock</DropdownMenuItem>
                  <DropdownMenuItem>Price</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* {addButtonText && (
              <Button
                className="h-10 bg-primary hover:bg-primary font-semibold px-4 shadow-sm"
                onClick={() => {
                  if (addButtonUrl) {
                    router.push(addButtonUrl, { locale });
                  } else if (isAddButtonModal) {
                    setOpenAddModal(true);
                  }
                }}
              >
                {addButtonText}
              </Button>
            )} */}
          </div>
        </div>

        {type === ToolbarType.product && activeFilterChips.length > 0 ? (
          <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-3">
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="mr-1 inline-flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Active filters
              </div>

              {activeFilterChips.map((chip) => (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-white px-2.5 py-1 text-xs text-slate-700"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-secondary/10 hover:text-secondary"
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={resetAllFilters}
              >
                Clear all
              </Button>
            </div>
          </div>
        ) : null}

        {!isDSP && (
          <div className="flex flex-col gap-2 rounded-xl border border-secondary/10 bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bulk Actions
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex h-9 flex-1 items-center gap-1 bg-white hover:bg-white/90 sm:flex-none"
                  >
                    Group action <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setOpenUpdateStatus(true)}
                    className="cursor-pointer"
                  >
                    Update Status
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={() => {
                      setOpenExportSelected(true);
                    }}
                    className="cursor-pointer"
                  >
                    Export Selected
                  </DropdownMenuItem>

                  {/* <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => setOpenEanDrawer(true)}
                  >
                    EAN
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex flex-1 items-center justify-end gap-2 text-sm font-medium sm:flex-none">
                <DropdownMenu>
                  <DropdownMenuContent className="w-150 p-4 space-y-4">
                    <FilterExportForm />
                  </DropdownMenuContent>
                </DropdownMenu>

                <ImportDialog setIsImporting={setIsImporting} isSupplier />
              </div>
            </div>
          </div>
        )}

        <UpdateStatusDialog
          open={openUpdateStatus}
          onOpenChange={setOpenUpdateStatus}
          productIds={product_ids ?? []}
        />

        <ExportSelectedProductsDialog
          open={openExportSelected}
          onOpenChange={setOpenExportSelected}
          productIds={product_ids ?? []}
          products={selectedProducts ?? []}
        />

        {isAddButtonModal && (
          <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
            <DialogContent className="w-1/3">
              <DialogHeader>
                <DialogTitle>{addButtonText}</DialogTitle>
              </DialogHeader>
              {addButtonModalContent &&
                React.cloneElement(
                  addButtonModalContent as React.ReactElement<{
                    onClose?: () => void;
                  }>,
                  { onClose: () => setOpenAddModal(false) },
                )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
