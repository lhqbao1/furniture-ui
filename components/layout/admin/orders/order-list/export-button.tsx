"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
import {
  getAllCheckOutMain,
  getCheckOutRefundOrders,
} from "@/features/checkout/api";
import { formatDateDDMMYYYY } from "@/lib/date-formated";
import { cn } from "@/lib/utils";
import { CheckOutMain } from "@/types/checkout";

import { mapOrderListTemplateRows } from "./export-order-template";
import { getStatusStyle } from "./status-styles";

interface ExportOrderExcelButtonProps {
  presetStatuses?: string[];
  lockStatusSelection?: boolean;
  expandByProductRefund?: boolean;
}

type ColumnOption = {
  key: string;
  label: string;
};

type ExportRow = Record<string, unknown>;

const parseCsvParam = (value: string | null) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseBooleanParam = (value: string | null): boolean | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

const parseShipmentFilterParam = (value: string | null): boolean | undefined => {
  if (!value) return undefined;
  return value.trim().toLowerCase() === "true" ? true : undefined;
};

const clean = (val: unknown) =>
  val === null || val === undefined || val === "None" ? "" : val;

const formatColumnLabel = (key: string) => {
  const customLabels: Record<string, string> = {
    id: "ID",
    code: "Order Code",
    marketplace_order_id: "Marketplace Order ID",
    ext_invoice_id: "Invoice ID",
    invoice_name: "Invoice Name",
    invoice_company_name: "Invoice Company Name",
    invoice_tax_number: "Invoice Tax Number",
    invoice_phone_number: "Invoice Phone Number",
    invoice_address: "Invoice Address",
    invoice_additional_address: "Invoice Additional Address",
    invoice_city: "Invoice City",
    invoice_postal_code: "Invoice Postal Code",
    invoice_country: "Invoice Country",
    recipient_name: "Shipping Recipient Name",
    recipient_phone_number: "Shipping Recipient Phone Number",
    shipping_address: "Shipping Address",
    shipping_additional_address: "Shipping Additional Address",
    shipping_city: "Shipping City",
    shipping_postal_code: "Shipping Postal Code",
    shipping_country: "Shipping Country",
    product_id: "Product IDs",
    product_names: "Product Names",
    total_quantity: "Total Quantity",
    shipping_amount: "Shipping Amount",
    products_cost: "Products Cost",
    freight_cost: "Freight Cost",
    discount_amout: "Discount Amount",
    total_amount: "Total Amount",
    net_amount: "Net Amount",
    shipping_date: "Shipping Date",
    tracking_number: "Tracking Number",
    shipping_code: "Shipping Code",
  };

  if (customLabels[key]) return customLabels[key];
  if (key.includes(" ")) return key;

  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const pickColumnsFromRows = (rows: ExportRow[], selectedColumns: string[]) =>
  rows.map((row) => {
    const pickedRow: ExportRow = {};

    selectedColumns.forEach((column) => {
      pickedRow[column] = row[column] ?? "";
    });

    return pickedRow;
  });

const mapRefundType = (value: unknown) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  if (normalized === "a-goods" || normalized === "agoods") {
    return "Return A Goods";
  }

  if (normalized === "c-goods" || normalized === "cgoods") {
    return "Return C Goods";
  }

  if (normalized === "no-return" || normalized === "noreturn") {
    return "No Item Return";
  }

  return "";
};

const buildRefundExportRows = (orders: CheckOutMain[]) => {
  const maxImageCount = Math.max(
    orders.reduce((max, order) => {
      const imageCount = (order.files ?? [])
        .map((file) => String(file?.url ?? "").trim())
        .filter(Boolean).length;
      return Math.max(max, imageCount);
    }, 0),
    1,
  );

  const imageHeaders = Array.from(
    { length: maxImageCount },
    (_, index) => `Image items refund ${index + 1}`,
  );

  const rows = orders.flatMap((order) => {
    const allItems = order.checkouts?.flatMap((checkout) => checkout.cart?.items ?? []) ?? [];
    const refundItems = Array.isArray(order.product_refund)
      ? order.product_refund
      : [];
    const checkoutImageUrls = (order.files ?? [])
      .map((file) => String(file?.url ?? "").trim())
      .filter(Boolean);

    const imageColumns = Object.fromEntries(
      imageHeaders.map((header, index) => [
        header,
        clean(checkoutImageUrls[index] ?? ""),
      ]),
    );

    const baseRow = {
      "Order ID": clean(order.marketplace_order_id || order.checkout_code),
      Marketplace: clean(order.from_marketplace ?? "Prestige Home"),
      Date: clean(formatDateDDMMYYYY(order.created_at)),
      Status: clean(getStatusStyle(order.status).text),
      Note: clean(order.note ?? ""),
    };

    const rowCount = Math.max(refundItems.length, 1);

    return Array.from({ length: rowCount }).map((_, index) => {
      const refundItem = refundItems[index];
      const matchedCartItem = refundItem
        ? allItems.find(
            (item) =>
              (item?.purchased_products?.sku ?? "") === (refundItem.sku ?? ""),
          ) ??
          allItems.find(
            (item) =>
              (item?.purchased_products?.id_provider ?? "") ===
              (refundItem.id_provider ?? ""),
          )
        : undefined;

      return {
        ...baseRow,
        "Refund items": clean(refundItem?.name ?? ""),
        "Refund items sku": clean(refundItem?.sku ?? ""),
        "Refund items ean": clean(
          matchedCartItem?.purchased_products?.ean ??
            matchedCartItem?.products?.ean ??
            "",
        ),
        "Refund quantity": clean(refundItem?.quantity ?? ""),
        "Item price": clean(refundItem?.unit_price ?? ""),
        "Refund amount": clean(refundItem?.refund_amount ?? ""),
        Reason: clean(refundItem?.reason ?? ""),
        "Refund type": clean(mapRefundType(refundItem?.type)),
        ...imageColumns,
      };
    });
  });

  const indexedRows = rows.map((row, index) => ({
    STT: index + 1,
    ...row,
  }));

  return { rows: indexedRows as ExportRow[], imageHeaders };
};

export default function ExportOrderExcelButton({
  presetStatuses,
  lockStatusSelection = false,
  expandByProductRefund = false,
}: ExportOrderExcelButtonProps) {
  const searchParams = useSearchParams();
  const [preparingColumns, setPreparingColumns] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<ColumnOption[]>([]);
  const [preparedRows, setPreparedRows] = useState<ExportRow[]>([]);
  const [preparedImageHeaders, setPreparedImageHeaders] = useState<string[]>([]);

  const normalizedPresetStatuses = useMemo(
    () =>
      Array.from(
        new Set(
          (presetStatuses ?? []).map((status) => status.trim()).filter(Boolean),
        ),
      ),
    [presetStatuses],
  );

  const channelValues = useMemo(
    () => parseCsvParam(searchParams.get("channel")),
    [searchParams],
  );

  const statusValuesFromFilter = useMemo(
    () => parseCsvParam(searchParams.get("status")),
    [searchParams],
  );

  const statusValues = useMemo(() => {
    if (lockStatusSelection && normalizedPresetStatuses.length > 0) {
      return normalizedPresetStatuses;
    }

    if (statusValuesFromFilter.length > 0) {
      return statusValuesFromFilter;
    }

    return normalizedPresetStatuses;
  }, [
    lockStatusSelection,
    normalizedPresetStatuses,
    statusValuesFromFilter,
  ]);

  const search = (searchParams.get("search") ?? "").trim();
  const multiSearchRaw = searchParams.get("multi_search") ?? "";
  const multiSearchValues = useMemo(
    () =>
      multiSearchRaw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    [multiSearchRaw],
  );
  const fromDate = searchParams.get("from_date") || undefined;
  const toDate = searchParams.get("to_date") || undefined;
  const filterByShipment = parseShipmentFilterParam(
    searchParams.get("filter_by_shipment"),
  );
  const isClaimedFactory = parseBooleanParam(
    searchParams.get("is_claimed_factory"),
  );
  const isClaimedMarketplace = parseBooleanParam(
    searchParams.get("is_claimed_marketplace"),
  );

  const hasExportFilters = useMemo(
    () => {
      if (expandByProductRefund) {
        return (
          channelValues.length > 0 ||
          Boolean(search) ||
          isClaimedFactory !== undefined ||
          isClaimedMarketplace !== undefined ||
          Boolean(multiSearchValues.length)
        );
      }

      return (
        statusValues.length > 0 ||
        channelValues.length > 0 ||
        Boolean(fromDate) ||
        Boolean(toDate) ||
        filterByShipment !== undefined ||
        Boolean(multiSearchValues.length)
      );
    },
    [
      expandByProductRefund,
      channelValues.length,
      filterByShipment,
      fromDate,
      isClaimedFactory,
      isClaimedMarketplace,
      multiSearchValues.length,
      search,
      statusValues.length,
      toDate,
    ],
  );

  const { refetch } = useQuery({
    queryKey: [
      "checkout-main-all-export",
      expandByProductRefund,
      channelValues.join(","),
      statusValues.join(","),
      search,
      multiSearchRaw,
      fromDate ?? null,
      toDate ?? null,
      filterByShipment ?? null,
      isClaimedFactory ?? null,
      isClaimedMarketplace ?? null,
    ],
    queryFn: async () => {
      if (expandByProductRefund) {
        const response = await getCheckOutRefundOrders({
          page: 1,
          page_size: 5000,
          ...(channelValues.length > 0 ? { channel: channelValues } : {}),
          ...(search ? { search } : {}),
          ...(isClaimedFactory !== undefined
            ? { is_claimed_factory: isClaimedFactory }
            : {}),
          ...(isClaimedMarketplace !== undefined
            ? { is_claimed_marketplace: isClaimedMarketplace }
            : {}),
        });

        return response.items;
      }

      return getAllCheckOutMain({
        ...(channelValues.length > 0 ? { channel: channelValues } : {}),
        ...(statusValues.length > 0 ? { status: statusValues } : {}),
        ...(fromDate ? { from_date: fromDate } : {}),
        ...(toDate ? { to_date: toDate } : {}),
        ...(filterByShipment !== undefined
          ? { filter_by_shipment: filterByShipment }
          : {}),
      });
    },
    enabled: false,
  });

  const selectedSet = useMemo(
    () => new Set(selectedColumns),
    [selectedColumns],
  );

  const filteredColumns = useMemo(() => {
    const query = columnSearch.trim().toLowerCase();
    if (!query) return availableColumns;

    return availableColumns.filter((column) => {
      const keyMatch = column.key.toLowerCase().includes(query);
      const labelMatch = column.label.toLowerCase().includes(query);
      return keyMatch || labelMatch;
    });
  }, [availableColumns, columnSearch]);

  const getExportFileName = () => {
    if (channelValues.length !== 1) return "order_export.xlsx";
    return `order_export_${channelValues[0]}.xlsx`;
  };

  const applyMultiSearchFilter = (data: CheckOutMain[]) => {
    if (multiSearchValues.length === 0) return data;

    const target = new Set(multiSearchValues);
    return data.filter((item) =>
      target.has(String(item.marketplace_order_id ?? "").trim().toLowerCase()),
    );
  };

  const prepareRowsFromData = (data: CheckOutMain[]) => {
    if (expandByProductRefund) {
      return buildRefundExportRows(data);
    }

    return {
      rows: mapOrderListTemplateRows(data) as ExportRow[],
      imageHeaders: [] as string[],
    };
  };

  const openColumnPicker = async () => {
    if (!hasExportFilters) {
      toast.warning("Please apply at least one filter before exporting.");
      return;
    }

    setPreparingColumns(true);
    try {
      const result = await refetch();
      const data = result.data ?? [];

      if (!data.length) {
        toast.info("No orders to export");
        return;
      }

      const filteredData = applyMultiSearchFilter(data);

      if (filteredData.length === 0) {
        toast.info("No orders matched the current multi-search filter");
        return;
      }

      const { rows, imageHeaders } = prepareRowsFromData(filteredData);

      if (rows.length === 0) {
        toast.info("No orders to export");
        return;
      }

      const nextAvailableColumns = Object.keys(rows[0] ?? {}).map((key) => ({
        key,
        label: formatColumnLabel(key),
      }));

      setPreparedRows(rows);
      setPreparedImageHeaders(imageHeaders);
      setAvailableColumns(nextAvailableColumns);
      setSelectedColumns(nextAvailableColumns.map((column) => column.key));
      setColumnSearch("");
      setColumnPickerOpen(true);
    } finally {
      setPreparingColumns(false);
    }
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

  const getOrderedSelectedColumns = () =>
    availableColumns
      .map((column) => column.key)
      .filter((key) => selectedSet.has(key));

  const handleExportExcel = async (columns: string[]) => {
    if (preparedRows.length === 0) {
      toast.info("No orders to export");
      return;
    }

    setExporting(true);
    try {
      const exportData = pickColumnsFromRows(preparedRows, columns);
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      preparedImageHeaders
        .filter((header) => columns.includes(header))
        .forEach((header) => {
          const colIndex = columns.indexOf(header);
          if (colIndex < 0) return;

          exportData.forEach((row, index) => {
            const imageUrl = String(row[header] ?? "").trim();
            if (!imageUrl) return;

            const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: colIndex });
            const safeUrl = imageUrl.replace(/"/g, '""');
            worksheet[cellRef] = { f: `IMAGE("${safeUrl}")` };
          });
        });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        getExportFileName(),
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
      <Button
        onClick={() => void openColumnPicker()}
        disabled={preparingColumns || exporting}
        className="h-10 min-w-[118px] px-4"
      >
        {preparingColumns || exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Export Excel"
        )}
      </Button>

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
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors",
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
    </div>
  );
}
