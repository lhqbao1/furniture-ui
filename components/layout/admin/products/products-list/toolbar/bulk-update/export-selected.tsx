"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
import { ProductItem } from "@/types/products";
import { buildProductExportData } from "../export-utils";

type ColumnOption = {
  key: string;
  label: string;
};

interface ExportSelectedProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
  products: ProductItem[];
}

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

const ExportSelectedProductsDialog = ({
  open,
  onOpenChange,
  productIds,
  products,
}: ExportSelectedProductsDialogProps) => {
  const [exporting, setExporting] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const availableColumns = useMemo<ColumnOption[]>(() => {
    const templateRows = buildProductExportData([{} as ProductItem]);
    const templateRow = (templateRows[0] ?? {}) as Record<string, unknown>;

    return Object.keys(templateRow).map((key) => ({
      key,
      label: formatColumnLabel(key),
    }));
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedColumns(availableColumns.map((column) => column.key));
    setColumnSearch("");
  }, [availableColumns, open]);

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
    if (!productIds.length) {
      toast.error("No products selected");
      return;
    }

    setExporting(true);
    const toastId = toast.loading("Preparing export...");

    try {
      if (!products.length) {
        toast.error("No products available to export", { id: toastId });
        return;
      }

      const filteredProducts = products.filter((item) =>
        productIds.includes(item.id),
      );

      const exportRows = buildProductExportData(filteredProducts) as Record<
        string,
        unknown
      >[];

      if (!exportRows.length) {
        toast.error("No selected products found", { id: toastId });
        return;
      }

      const exportData = pickColumnsFromRows(exportRows, columns);

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

      toast.success("Export completed", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Export failed", { id: toastId });
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

    await handleExportExcel(columns);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden border-secondary/15 p-0">
        <DialogHeader className="border-b border-secondary/10 bg-gradient-to-r from-secondary/5 via-white to-secondary/5 p-6">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Choose Columns
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Export selected products will include only selected columns.
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirmExport()}
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
  );
};

export default ExportSelectedProductsDialog;
