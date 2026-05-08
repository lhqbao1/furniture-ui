"use client";

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCheck, Loader2, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getAllProductsSelect } from "@/features/product-group/api";
import { ProductItem } from "@/types/products";
import { buildProductExportData } from "./export-utils";

type ColumnOption = {
  key: string;
  label: string;
};

const formatColumnLabel = (key: string) => {
  const customLabels: Record<string, string> = {
    id: "ID Provider",
    ean: "EAN",
    img_url: "Image URLs",
    weee_nr: "WEEE Number",
    SEO_keywords: "SEO Keywords",
    log_length: "Package Length",
    log_width: "Package Width",
    log_height: "Package Height",
    log_weight: "Package Weight",
  };

  if (customLabels[key]) return customLabels[key];

  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const pickColumnsFromRows = (
  rows: Record<string, unknown>[],
  selectedColumns: string[],
) => {
  return rows.map((row) => {
    const pickedRow: Record<string, unknown> = {};

    selectedColumns.forEach((column) => {
      pickedRow[column] = row[column] ?? "";
    });

    return pickedRow;
  });
};

const FilterExportForm = () => {
  const [exporting, setExporting] = useState(false);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const supplierId = searchParams.get("supplier_id") ?? "";
  const statusParam = searchParams.get("all_products");
  const search = searchParams.get("search")?.trim() ?? "";
  const sortByStock = searchParams.get("sort_by_stock") ?? "";
  const sortByIncomingStock = searchParams.get("sort_by_incoming_stock") ?? "";
  const sortByMarketplace = searchParams.get("sort_by_marketplace") ?? "";
  const isInventory = searchParams.get("is_inventory") ?? "";
  const multiSearchRaw = searchParams.get("multi_search") ?? "";

  const buildParams = () => {
    const params: Record<string, string | boolean> = {};

    if (statusParam === "true") {
      params.all_products = true;
    } else if (statusParam === "false") {
      params.all_products = false;
    }

    if (supplierId) {
      params.supplier_id = supplierId;
    }

    if (search) {
      params.search = search;
    }

    if (sortByStock) {
      params.sort_by_stock = sortByStock;
    }

    if (sortByIncomingStock) {
      params.sort_by_incoming_stock = sortByIncomingStock;
    }

    if (sortByMarketplace) {
      params.sort_by_marketplace = sortByMarketplace;
    }

    if (isInventory) {
      params.is_inventory = isInventory;
    }

    return params;
  };

  const { refetch } = useQuery({
    queryKey: [
      "all-products",
      supplierId,
      statusParam ?? "all",
      search,
      sortByStock,
      sortByIncomingStock,
      sortByMarketplace,
      isInventory,
    ],
    queryFn: () => getAllProductsSelect(buildParams()),
    enabled: false,
  });

  const normalizeProductsResponse = (payload: unknown): ProductItem[] => {
    if (Array.isArray(payload)) return payload as ProductItem[];

    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as { items?: unknown[] }).items)
    ) {
      return (payload as { items: ProductItem[] }).items;
    }

    return [];
  };

  const applyMultiSearchFilter = (products: ProductItem[]): ProductItem[] => {
    const terms = multiSearchRaw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (terms.length === 0) return products;

    const target = new Set(terms);
    return products.filter((item) => {
      const candidates = [item.sku, item.ean, item.id_provider]
        .map((value) =>
          String(value ?? "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean);
      return candidates.some((candidate) => target.has(candidate));
    });
  };

  const availableColumns = useMemo<ColumnOption[]>(() => {
    const templateRows = buildProductExportData([{} as ProductItem]);
    const templateRow = (templateRows[0] ?? {}) as Record<string, unknown>;

    return Object.keys(templateRow).map((key) => ({
      key,
      label: formatColumnLabel(key),
    }));
  }, []);

  const filteredColumns = useMemo(() => {
    const query = columnSearch.trim().toLowerCase();
    if (!query) return availableColumns;

    return availableColumns.filter((column) => {
      const keyMatch = column.key.toLowerCase().includes(query);
      const labelMatch = column.label.toLowerCase().includes(query);
      return keyMatch || labelMatch;
    });
  }, [availableColumns, columnSearch]);

  const selectedSet = useMemo(
    () => new Set(selectedColumns),
    [selectedColumns],
  );
  const hasExportFilters = useMemo(
    () =>
      statusParam !== null ||
      Boolean(supplierId) ||
      Boolean(search) ||
      Boolean(sortByStock) ||
      Boolean(sortByIncomingStock) ||
      Boolean(sortByMarketplace) ||
      Boolean(isInventory),
    [
      isInventory,
      search,
      sortByIncomingStock,
      sortByMarketplace,
      sortByStock,
      statusParam,
      supplierId,
    ],
  );

  const openColumnPicker = () => {
    if (!hasExportFilters) {
      toast.warning("Bạn nên chọn ít nhất 1 filter trước khi export");
      return;
    }

    setSelectedColumns(availableColumns.map((column) => column.key));
    setColumnSearch("");
    setColumnPickerOpen(true);
  };

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns((current) => {
      if (current.includes(columnKey)) {
        return current.filter((key) => key !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const setColumnChecked = (columnKey: string, checked: boolean) => {
    setSelectedColumns((current) => {
      if (checked) {
        if (current.includes(columnKey)) return current;
        return [...current, columnKey];
      }

      return current.filter((key) => key !== columnKey);
    });
  };

  const selectAllColumns = () => {
    setSelectedColumns(availableColumns.map((column) => column.key));
  };

  const clearAllColumns = () => {
    setSelectedColumns([]);
  };

  const getOrderedSelectedColumns = () => {
    return availableColumns
      .map((column) => column.key)
      .filter((key) => selectedSet.has(key));
  };

  const handleExportExcel = async (columns: string[]) => {
    setExporting(true);
    try {
      const res = await refetch();
      const data = applyMultiSearchFilter(normalizeProductsResponse(res.data));
      if (!data.length) {
        toast.info("No products to export");
        return;
      }

      const exportData = pickColumnsFromRows(
        buildProductExportData(data) as Record<string, unknown>[],
        columns,
      );

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `export-${Date.now()}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmExport = async () => {
    const columns = getOrderedSelectedColumns();

    if (columns.length === 0) {
      toast.info("Please select at least one column");
      return;
    }

    setColumnPickerOpen(false);
    await handleExportExcel(columns);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-start gap-2">
        <Button
          onClick={openColumnPicker}
          disabled={exporting}
          type="button"
          className="h-11"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Export Excel"
          )}
        </Button>
      </div>

      <Dialog open={columnPickerOpen} onOpenChange={setColumnPickerOpen}>
        <DialogContent className="max-w-4xl overflow-hidden border-secondary/15 p-0">
          <DialogHeader className="border-b border-secondary/10 bg-gradient-to-r from-secondary/5 via-white to-secondary/5 p-6">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Choose Columns
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Export Excel will include only selected columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={columnSearch}
                  onChange={(event) => setColumnSearch(event.target.value)}
                  placeholder="Search column by key or label"
                  className="h-10 pl-9"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {selectedColumns.length}/{availableColumns.length} selected
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={selectAllColumns}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={clearAllColumns}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={selectAllColumns}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Default
                </Button>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto rounded-xl border border-secondary/15 bg-muted/20 p-3">
              {filteredColumns.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                  {filteredColumns.map((column) => {
                    const checked = selectedSet.has(column.key);

                    return (
                      <div
                        key={column.key}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleColumn(column.key)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleColumn(column.key);
                          }
                        }}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer",
                          checked
                            ? "border-secondary/40 bg-secondary/10"
                            : "border-secondary/15 bg-white hover:bg-secondary/5",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onClick={(event) => event.stopPropagation()}
                          onCheckedChange={(value) =>
                            setColumnChecked(column.key, value === true)
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {column.label}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {column.key}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No columns match your search.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-secondary/10 bg-white px-6 py-4 sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Tip: default is all columns selected.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setColumnPickerOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmExport}
                disabled={exporting || selectedColumns.length === 0}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Export now"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterExportForm;
