"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getAllCheckOutMain,
  getCheckOutRefundOrders,
} from "@/features/checkout/api";
import { formatDateDDMMYYYY } from "@/lib/date-formated";

import { exportOrderListTemplateToExcel } from "./export-order-template";
import { getStatusStyle } from "./status-styles";

interface ExportOrderExcelButtonProps {
  presetStatuses?: string[];
  lockStatusSelection?: boolean;
  expandByProductRefund?: boolean;
}

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

export default function ExportOrderExcelButton({
  presetStatuses,
  lockStatusSelection = false,
  expandByProductRefund = false,
}: ExportOrderExcelButtonProps) {
  const searchParams = useSearchParams();

  const normalizedPresetStatuses = useMemo(
    () =>
      Array.from(
        new Set((presetStatuses ?? []).map((status) => status.trim()).filter(Boolean)),
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
  const country = searchParams.get("country") || undefined;
  const isB2B = parseBooleanParam(searchParams.get("is_b2b"));
  const isClaimedFactory = parseBooleanParam(
    searchParams.get("is_claimed_factory"),
  );
  const isClaimedMarketplace = parseBooleanParam(
    searchParams.get("is_claimed_marketplace"),
  );

  const { isFetching, refetch } = useQuery({
    queryKey: [
      "checkout-main-all-export",
      expandByProductRefund,
      channelValues.join(","),
      statusValues.join(","),
      search,
      multiSearchRaw,
      fromDate ?? null,
      toDate ?? null,
      country ?? null,
      isB2B ?? null,
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
        ...(search ? { search } : {}),
        ...(country ? { country } : {}),
        ...(isB2B !== undefined ? { is_b2b: isB2B } : {}),
      });
    },
    enabled: false,
  });

  const getExportFileName = () => {
    if (channelValues.length !== 1) return "order_export.xlsx";
    return `order_export_${channelValues[0]}.xlsx`;
  };

  const handleExport = async () => {
    const result = await refetch();
    const data = result.data;

    if (!data || data.length === 0) {
      toast.info("No orders to export");
      return;
    }

    const target = new Set(multiSearchValues);
    const filteredData =
      target.size === 0
        ? data
        : data.filter((item) =>
            target.has(
              String(item.marketplace_order_id ?? "")
                .trim()
                .toLowerCase(),
            ),
          );

    if (filteredData.length === 0) {
      toast.info("No orders matched the current multi-search filter");
      return;
    }

    const clean = (val: unknown) =>
      val === null || val === undefined || val === "None" ? "" : val;

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
        "Refund type",
      ] as const;

      const maxImageCount = Math.max(
        filteredData.reduce((max, order) => {
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

      const refundRows = filteredData.flatMap((p) => {
        const allItems = p.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [];
        const refundItems = Array.isArray(p.product_refund)
          ? p.product_refund
          : [];
        const checkoutImageUrls = (p.files ?? [])
          .map((file) => String(file?.url ?? "").trim())
          .filter(Boolean);

        const imageColumns = Object.fromEntries(
          imageHeaders.map((header, index) => [
            header,
            clean(checkoutImageUrls[index] ?? ""),
          ]),
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
          const matchedCartItem = refundItem
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
            "Refund type": clean(mapRefundType(refundItem?.type)),
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
        { wch: 20 },
        ...imageHeaders.map(() => ({ wch: 24 })),
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, getExportFileName());
      return;
    }

    exportOrderListTemplateToExcel(filteredData, getExportFileName());
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isFetching}
      className="h-10 min-w-[118px] px-4"
    >
      {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Export Excel"}
    </Button>
  );
}
