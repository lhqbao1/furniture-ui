"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { getAllRevenueInventory } from "@/features/products/api";
import type { GetAllRevenueInventoryParams } from "@/features/products/api";
import type { ProductItem } from "@/types/products";

type PhysicalInventoryExportRow = {
  sku: string;
  "tên sản phẩm": string;
  "số lượng": number;
  cost: number | string;
  "tổng cost": number;
};

const EXPORT_PAGE_SIZE = 10000;

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const parseBooleanParam = (value: string | null): boolean | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

const parseSearchTerms = (value: string | null) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildExportRows = (products: ProductItem[]): PhysicalInventoryExportRow[] => {
  const productRows = products.map((product) => {
    const quantity = toNumber(product.stock);
    const cost = toNumber(product.cost);

    return {
      sku: product.sku ?? "",
      "tên sản phẩm": product.name ?? "",
      "số lượng": quantity,
      cost: cost > 0 ? Number(cost.toFixed(2)) : "",
      "tổng cost": Number((quantity * cost).toFixed(2)),
    };
  });

  const totals = productRows.reduce(
    (acc, row) => ({
      quantity: acc.quantity + row["số lượng"],
      totalCost: acc.totalCost + row["tổng cost"],
    }),
    { quantity: 0, totalCost: 0 },
  );

  return [
    ...productRows,
    {
      sku: "",
      "tên sản phẩm": "Total",
      "số lượng": totals.quantity,
      cost: "",
      "tổng cost": Number(totals.totalCost.toFixed(2)),
    },
  ];
};

export default function PhysicalInventoryExportButton() {
  const searchParams = useSearchParams();

  const paramsForExport = useMemo<GetAllRevenueInventoryParams>(() => {
    const searchTerms = parseSearchTerms(searchParams.get("multi_search"));
    const search = searchParams.get("search")?.trim() ?? "";
    const isEconelo = parseBooleanParam(searchParams.get("is_econelo"));

    return {
      page: 1,
      page_size: EXPORT_PAGE_SIZE,
      search: searchTerms.length > 0 ? searchTerms : search || undefined,
      is_econelo: isEconelo,
    };
  }, [searchParams]);

  const { refetch, isFetching } = useQuery({
    queryKey: [
      "physical-inventory-export",
      paramsForExport.search,
      paramsForExport.is_econelo,
    ],
    queryFn: () => getAllRevenueInventory(paramsForExport),
    enabled: false,
  });

  const handleExport = async () => {
    const result = await refetch();
    const products = (result.data?.items ?? []) as ProductItem[];

    if (!products.length) {
      toast.info("No physical inventory data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(buildExportRows(products));
    worksheet["!cols"] = [
      { wch: 24 },
      { wch: 56 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Physical Inventory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `physical-inventory-${Date.now()}.xlsx`,
    );
  };

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isFetching}
      className="w-full bg-secondary text-white hover:bg-secondary/90"
    >
      {isFetching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export
        </>
      )}
    </Button>
  );
}
