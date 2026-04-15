"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllCheckOutMain, getCheckOutRefundOrders } from "@/features/checkout/api";
import { getStatusStyle } from "./status-styles";
import { formatDateDDMMYYYY } from "@/lib/date-formated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { CHANEL_OPTIONS } from "./filter/filter-order-chanel";
import { STATUS_OPTIONS } from "@/data/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { exportOrderListTemplateToExcel } from "./export-order-template";

interface ExportOrderExcelButtonProps {
  presetStatuses?: string[];
  lockStatusSelection?: boolean;
  expandByProductRefund?: boolean;
}

export default function ExportOrderExcelButton({
  presetStatuses,
  lockStatusSelection = false,
  expandByProductRefund = false,
}: ExportOrderExcelButtonProps) {
  const sortedChannelOptions = useMemo(
    () =>
      [...CHANEL_OPTIONS].sort((a, b) =>
        a.label.localeCompare(b.label, "de", { sensitivity: "base" }),
      ),
    [],
  );
  const channelOptions = useMemo(
    () => [{ key: "", label: "All" }, ...sortedChannelOptions],
    [sortedChannelOptions],
  );
  const [openChannel, setOpenChannel] = useState(false);
  const normalizedPresetStatuses = useMemo(
    () => Array.from(new Set((presetStatuses ?? []).map((status) => status.trim()))),
    [presetStatuses],
  );
  const baseStatuses = useMemo(
    () => (lockStatusSelection ? normalizedPresetStatuses : []),
    [lockStatusSelection, normalizedPresetStatuses],
  );
  const [marketplace, setMarketplace] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>(baseStatuses);

  useEffect(() => {
    setSelectedStatus(baseStatuses);
  }, [baseStatuses]);

  const hasFilters = useMemo(() => {
    if (marketplace !== "") return true;

    const current = [...selectedStatus].sort().join(",");
    const initial = [...baseStatuses].sort().join(",");
    return current !== initial;
  }, [baseStatuses, marketplace, selectedStatus]);
  const selectedChannelLabel = useMemo(
    () => channelOptions.find((item) => item.key === marketplace)?.label ?? "All",
    [channelOptions, marketplace],
  );

  const { isFetching, refetch } = useQuery({
    queryKey: [
      "checkout-main-all",
      marketplace,
      selectedStatus.join(","),
      expandByProductRefund,
    ],
    queryFn: async () => {
      if (expandByProductRefund) {
        const response = await getCheckOutRefundOrders({
          page: 1,
          page_size: 5000,
          ...(marketplace ? { channel: [marketplace] } : {}),
        });
        return response.items;
      }

      return getAllCheckOutMain(marketplace, selectedStatus);
    },
    enabled: false, // ❌ không auto call
  });

  const toggleStatus = (item: (typeof STATUS_OPTIONS)[number]) => {
    if (lockStatusSelection) return;

    const backendStatuses = item.statuses ?? [item.key];
    const isSelected = backendStatuses.every((status) =>
      selectedStatus.includes(status),
    );

    if (isSelected) {
      setSelectedStatus((prev) =>
        prev.filter((status) => !backendStatuses.includes(status)),
      );
      return;
    }

    setSelectedStatus((prev) =>
      Array.from(new Set([...prev, ...backendStatuses])),
    );
  };

  const getExportFileName = (marketplace: string) => {
    if (!marketplace) return "order_export.xlsx";

    return `order_export_${marketplace}.xlsx`;
  };

  const handleExport = async () => {
    const res = await refetch(); // 🔥 gọi API tại đây
    const data = res.data;

    if (!data || data.length === 0) return;

    // Hàm xử lý giá trị null / undefined / "None"
    const clean = (val: unknown) =>
      val === null || val === undefined || val === "None" ? "" : val;

    if (expandByProductRefund) {
      const baseRefundHeaders = [
        "STT",
        "Order ID",
        "Marketplace",
        "Date",
        "Status",
        "Note",
        "Refund items",
        "Refund items sku",
        "Refund items ean",
        "Refund quantity",
        "Item price",
        "Refund amount",
        "Reason",
      ] as const;
      const maxImageCount = Math.max(
        data.reduce((max, order) => {
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
      const refundHeaders = [...baseRefundHeaders, ...imageHeaders] as string[];

      const refundRows = data.flatMap((p) => {
        const allItems = p.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [];
        const refundItems = Array.isArray(p.product_refund) ? p.product_refund : [];
        const checkoutImageUrls = (p.files ?? [])
          .map((file) => String(file?.url ?? "").trim())
          .filter(Boolean);
        const imageColumns = Object.fromEntries(
          imageHeaders.map((header, index) => [header, clean(checkoutImageUrls[index] ?? "")]),
        );

        const baseRow = {
          "Order ID": clean(p.marketplace_order_id || p.checkout_code),
          Marketplace: clean(p.from_marketplace ?? "Prestige Home"),
          Date: clean(formatDateDDMMYYYY(p.created_at)),
          Status: clean(getStatusStyle(p.status).text),
          Note: clean(p.note ?? ""),
        };

        const rowCount = Math.max(refundItems.length, 1);

        return Array.from({ length: rowCount }).map((_, index) => {
          const refundItem = refundItems[index];
          const matchedCartItem =
            refundItem
              ? allItems.find(
                  (item) =>
                    (item?.purchased_products?.sku ?? "") ===
                    (refundItem.sku ?? ""),
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
            ...imageColumns,
          };
        });
      });

      const indexedRows = refundRows.map((row, index) => ({
        STT: index + 1,
        ...row,
      }));

      const worksheet = XLSX.utils.json_to_sheet(indexedRows, {
        header: [...refundHeaders],
      });

      imageHeaders.forEach((header) => {
        const colIndex = refundHeaders.indexOf(header);
        if (colIndex < 0) return;

        indexedRows.forEach((row, index) => {
          const imageUrl = String(
            (row as Record<string, unknown>)[header] ?? "",
          ).trim();
          if (!imageUrl) return;

          const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: colIndex });
          const safeUrl = imageUrl.replace(/"/g, '""');

          worksheet[cellRef] = { f: `IMAGE("${safeUrl}")` };
        });
      });

      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 24 },
        { wch: 34 },
        { wch: 22 },
        { wch: 20 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 34 },
        ...imageHeaders.map(() => ({ wch: 24 })),
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, getExportFileName(marketplace));
      return;
    }

    exportOrderListTemplateToExcel(data, getExportFileName(marketplace));
  };

  const handleResetFilters = () => {
    setMarketplace("");
    setSelectedStatus(baseStatuses);
  };

  const lockedStatusLabel = useMemo(() => {
    if (!lockStatusSelection || normalizedPresetStatuses.length === 0) return "";

    const labels = normalizedPresetStatuses.map((status) => {
      const matched = STATUS_OPTIONS.find(
        (option) =>
          option.key === status || option.statuses?.some((item) => item === status),
      );
      return matched?.label ?? status;
    });

    return labels.join(", ");
  }, [lockStatusSelection, normalizedPresetStatuses]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-lg border-secondary/20 bg-white px-4 font-medium shadow-sm hover:bg-muted/30"
        >
          Export Orders
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[350px] rounded-xl border border-secondary/15 p-0 shadow-xl"
      >
        <div className="space-y-4 p-4">
          <div className="border-b border-secondary/10 pb-3">
            <h3 className="text-base font-semibold leading-none text-foreground">
              Export Orders
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter your data before exporting.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Channel
            </Label>

            <Popover open={openChannel} onOpenChange={setOpenChannel}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="h-11 w-full justify-between border bg-white font-normal"
                >
                  {selectedChannelLabel}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                usePortal={false}
                className="z-[120] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
              >
                <Command>
                  <CommandInput placeholder="Search channel..." />
                  <CommandList>
                    <CommandEmpty>No channel found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {channelOptions.map((item) => (
                        <CommandItem
                          key={item.key || "all"}
                          value={`${item.label} ${item.key}`}
                          onSelect={() => {
                            setMarketplace(item.key);
                            setOpenChannel(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              marketplace === item.key ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <Select>
              <SelectTrigger
                className="h-11 border bg-white"
                disabled={lockStatusSelection}
              >
                <SelectValue
                  placeholder={
                    lockStatusSelection && lockedStatusLabel
                      ? lockedStatusLabel
                      : "Choose status"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-96">
                {STATUS_OPTIONS.map((item) => (
                  <div
                    key={item.key}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-accent"
                    onClick={() => toggleStatus(item)}
                  >
                    <Checkbox
                      checked={
                        item.statuses
                          ? item.statuses.every((status) =>
                              selectedStatus.includes(status),
                            )
                          : selectedStatus.includes(item.key)
                      }
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!hasFilters || isFetching}
              className="h-11 flex-1"
            >
              Reset Filters
            </Button>

            <Button
              onClick={handleExport}
              disabled={isFetching}
              className="h-11 flex-1"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Export Excel"
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
