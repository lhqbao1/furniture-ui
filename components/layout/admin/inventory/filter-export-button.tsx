"use client";

import { Button } from "@/components/ui/button";
import { getAllProductsSelect } from "@/features/product-group/api";
import { useQuery } from "@tanstack/react-query";
import { format, getISOWeek } from "date-fns";
import { saveAs } from "file-saver";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ProductItem } from "@/types/products";

type ExportCellValue = string | number;

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const getIncomingLabel = (product: ProductItem): string => {
  const inventoryPos = product.inventory_pos ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = inventoryPos.filter((item) => {
    if (!item.list_delivery_date) return false;
    const date = new Date(item.list_delivery_date);
    if (Number.isNaN(date.getTime())) return false;
    date.setHours(0, 0, 0, 0);
    return date > today;
  });

  if (!upcoming.length) return "—";

  return upcoming
    .map((item) => {
      const date = item.list_delivery_date ? new Date(item.list_delivery_date) : null;
      const formattedDate =
        date && !Number.isNaN(date.getTime())
          ? `CW ${String(getISOWeek(date)).padStart(2, "0")} - ${format(
              date,
              "MMMM d",
            )}`
          : "—";

      return `${item.quantity ?? 0} | ${formattedDate}`;
    })
    .join(" ; ");
};

const buildNameCell = (product: ProductItem): string => {
  if (!product.sku) return product.name ?? "";
  return `${product.name ?? ""}\nSKU: ${product.sku}`;
};

const buildInventoryExportRow = (
  product: ProductItem,
): Record<string, ExportCellValue> => {
  const reserved = toNumber(product.result_stock);
  const physical = toNumber(product.stock);
  const available = physical - Math.abs(reserved);
  const cost = toNumber(product.cost);
  const finalPrice = toNumber(product.final_price);
  const safeAvailable = Math.max(0, available);

  const availableValue: ExportCellValue =
    cost > 0 ? Number((cost * safeAvailable).toFixed(2)) : "—";

  const reservedValue: ExportCellValue = reserved
    ? Number((cost * reserved).toFixed(2))
    : "—";

  const physicalValue: ExportCellValue =
    physical && cost > 0 ? Number((cost * physical).toFixed(2)) : "—";

  const availableSaleValue: ExportCellValue =
    available && finalPrice > 0
      ? Number((finalPrice * safeAvailable).toFixed(2))
      : "—";

  return {
    ID: String(product.id_provider ?? ""),
    EAN: String(product.ean ?? ""),
    NAME: buildNameCell(product),
    "PURCHASE COST": cost > 0 ? Number(cost.toFixed(2)) : "—",
    "SALE PRICE": finalPrice > 0 ? Number(finalPrice.toFixed(2)) : "—",
    AVAILABLE: available,
    RESERVED: reserved,
    PHYSICAL: physical,
    INCOMING: getIncomingLabel(product),
    "AVAILABLE VALUE": availableValue,
    "RESERVED VALUE": reservedValue,
    "PHYSICAL VALUE": physicalValue,
    "AVAILABLE SALE VALUE": availableSaleValue,
  };
};

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

export default function InventoryFilterExportButton() {
  const searchParams = useSearchParams();

  const paramsForExport = useMemo(() => {
    const statusParam = searchParams.get("all_products");
    const search = searchParams.get("search")?.trim() ?? "";
    const supplierId = searchParams.get("supplier_id") ?? "";
    const brandId = searchParams.get("brand_id") ?? "";
    const sortByStock = searchParams.get("sort_by_stock") ?? "";
    const sortByIncomingStock = searchParams.get("sort_by_incoming_stock") ?? "";
    const sortByMarketplace = searchParams.get("sort_by_marketplace") ?? "";
    const isInventory = searchParams.get("is_inventory") ?? "false";

    const params: {
      all_products?: boolean;
      search?: string;
      supplier_id?: string;
      brand_id?: string;
      sort_by_stock?: string;
      sort_by_incoming_stock?: string;
      sort_by_marketplace?: string;
      is_inventory: string;
    } = {
      is_inventory: isInventory,
    };

    if (statusParam === "true") {
      params.all_products = true;
    } else if (statusParam === "false") {
      params.all_products = false;
    }

    if (search) params.search = search;
    if (supplierId) params.supplier_id = supplierId;
    if (brandId) params.brand_id = brandId;
    if (sortByStock) params.sort_by_stock = sortByStock;
    if (sortByIncomingStock) params.sort_by_incoming_stock = sortByIncomingStock;
    if (sortByMarketplace) params.sort_by_marketplace = sortByMarketplace;

    return params;
  }, [searchParams]);

  const { refetch, isFetching } = useQuery({
    queryKey: [
      "inventory-export-filtered",
      paramsForExport.all_products ?? "all",
      paramsForExport.search ?? "",
      paramsForExport.supplier_id ?? "",
      paramsForExport.brand_id ?? "",
      paramsForExport.sort_by_stock ?? "",
      paramsForExport.sort_by_incoming_stock ?? "",
      paramsForExport.sort_by_marketplace ?? "",
      paramsForExport.is_inventory,
    ],
    queryFn: () => getAllProductsSelect(paramsForExport),
    enabled: false,
  });

  const handleExport = async () => {
    const res = await refetch();
    const products = normalizeProductsResponse(res.data);

    if (!products.length) {
      toast.info("No products to export with current filters");
      return;
    }

    const exportRows = products.map(buildInventoryExportRow);
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `inventory-export-${Date.now()}.xlsx`,
    );
  };

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isFetching}
      className="bg-secondary text-white hover:bg-secondary/90"
    >
      {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Export Excel"}
    </Button>
  );
}
