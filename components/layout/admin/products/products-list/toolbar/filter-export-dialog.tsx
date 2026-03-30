"use client";
import { Button } from "@/components/ui/button";
import { getAllProductsSelect } from "@/features/product-group/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";
import { ProductItem } from "@/types/products";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { toast } from "sonner";

type ExportAction = "excel" | "csv" | "praktiker" | "search" | null;

const FilterExportForm = () => {
  const [exportingAction, setExportingAction] = useState<ExportAction>(null);
  const searchParams = useSearchParams();
  const supplierId = searchParams.get("supplier_id") ?? "";
  const statusParam = searchParams.get("all_products");
  const brandId = searchParams.get("brand_id") ?? "";
  const search = searchParams.get("search")?.trim() ?? "";
  const sortByStock = searchParams.get("sort_by_stock") ?? "";
  const sortByIncomingStock = searchParams.get("sort_by_incoming_stock") ?? "";
  const sortByMarketplace = searchParams.get("sort_by_marketplace") ?? "";
  const isInventory = searchParams.get("is_inventory") ?? "";
  const isEconeloParam = searchParams.get("is_econelo");
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

    if (brandId) {
      params.brand_id = brandId;
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

    if (isEconeloParam === "true") {
      params.is_econelo = true;
    } else if (isEconeloParam === "false") {
      params.is_econelo = false;
    }

    return params;
  };

  const { refetch } = useQuery({
    queryKey: [
      "all-products",
      supplierId,
      statusParam ?? "all",
      brandId,
      search,
      sortByStock,
      sortByIncomingStock,
      sortByMarketplace,
      isInventory,
      isEconeloParam ?? "all",
    ],
    queryFn: () => getAllProductsSelect(buildParams()),
    enabled: false,
  });
  const isAnyExporting = exportingAction !== null;

  const buildExportData = (data: ProductItem[], imageDelimiter = "|") => {
    const clean = (val: unknown) =>
      val === null || val === undefined ? "" : val;

    return data.map((p) => {
      const rawTariff = clean(p.tariff_number);
      const tariff =
        rawTariff !== "" && rawTariff !== null && rawTariff !== undefined
          ? Number(rawTariff)
          : null;

      const rawVat = clean(p.tax);
      const vat =
        rawVat && rawVat.includes("%")
          ? Number(rawVat.replace("%", "").trim())
          : null;

      const getMarketplaceStatus = (
        marketplaces: ProductItem["marketplace_products"] | undefined,
        name: string,
      ) => {
        if (!Array.isArray(marketplaces)) return "not synced";
        const found = marketplaces.find(
          (m) => m.marketplace?.toLowerCase() === name,
        );
        if (!found) return "not synced";
        return found.is_active ? "synced" : "not synced";
      };

      return {
        id: Number(clean(p.id_provider)),
        ean: String(clean(p.ean)),
        status: p.is_active === true ? "ACTIVE" : "INACTIVE",
        brand_name: clean(p.brand?.name),
        supplier_name: clean(p.owner?.business_name ?? "Prestige Home"),
        manufacturer_sku: clean(p.sku),
        manufacturing_country: clean(p.manufacture_country),
        customs_tariff_nr: Number.isFinite(tariff) ? tariff : null,
        name: clean(p.name),
        description: clean(p.description),
        technical_description: clean(p.technical_description),
        categories: clean(p.categories?.map((c) => c.code).join(", ")),
        category_name: clean(p.categories?.map((c) => c.name).join(", ")),
        unit: clean(p.unit),
        amount_unit: Number(clean(p.amount_unit)),
        delivery_time: clean(p.delivery_time),
        carrier: clean(p.carrier),
        net_purchase_cost: clean(p.cost),
        delivery_cost: clean(p.delivery_cost),
        return_cost: clean(p.return_cost),
        original_price: clean(p.price),
        sale_price: clean(p.final_price),
        shipping_revenue: clean(
          p.carrier === "amm" || p.carrier === "spedition" ? 35.95 : 5.95,
        ),
        vat: vat,
        stock: clean(calculateAvailableStock(p)),
        img_url: clean(
          p.static_files
            ?.map((f) => f.url.replaceAll(" ", "%20"))
            .join(imageDelimiter),
        ),
        length: clean(p.length),
        width: clean(p.width),
        height: clean(p.height),
        weight: clean(p.weight),
        weee_nr: clean(p.weee_nr),
        eek: clean(p.eek),
        SEO_keywords: clean(p.meta_keywords),
        materials: clean(p.materials),
        color: clean(p.color),
        log_length: clean(p.packages?.reduce((s, q) => s + (q.length || 0), 0)),
        log_width: clean(p.packages?.reduce((s, q) => s + (q.width || 0), 0)),
        log_height: clean(p.packages?.reduce((s, q) => s + (q.height || 0), 0)),
        log_weight: clean(p.packages?.reduce((s, q) => s + (q.weight || 0), 0)),
        benutzerhandbuch: clean(
          p.pdf_files
            ?.filter((f) =>
              f?.title?.toLowerCase?.().includes("benutzerhandbuch"),
            )
            .map((f) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        sicherheit_information: clean(
          p.pdf_files
            ?.filter((f) => f?.title?.toLowerCase?.().includes("sicherheit"))
            .map((f) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        aufbauanleitung: clean(
          p.pdf_files
            ?.filter((f) =>
              f?.title?.toLowerCase?.().includes("aufbauanleitung"),
            )
            .map((f) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        product_link: `https://www.prestige-home.de/de/product/${p.url_key}`,
        amazon: getMarketplaceStatus(p.marketplace_products, "amazon"),
        kaufland: getMarketplaceStatus(p.marketplace_products, "kaufland"),
        ebay: getMarketplaceStatus(p.marketplace_products, "ebay"),
      };
    });
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

  const applyMultiSearchFilter = (products: ProductItem[]): ProductItem[] => {
    const terms = multiSearchRaw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (terms.length === 0) return products;

    const target = new Set(terms);
    return products.filter((item) => {
      const candidates = [item.sku, item.ean, item.id_provider]
        .map((value) => String(value ?? "").trim().toLowerCase())
        .filter(Boolean);
      return candidates.some((candidate) => target.has(candidate));
    });
  };

  const handleExportExcel = async () => {
    setExportingAction("excel");
    try {
      const res = await refetch();
      const data = applyMultiSearchFilter(normalizeProductsResponse(res.data));
      if (!data.length) {
        toast.info("No products to export");
        return;
      }

      const exportData = buildExportData(data);

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
      setExportingAction(null);
    }
  };

  const handleExportExcelWithSearch = async () => {
    const searchValue = search || undefined;
    setExportingAction("search");
    try {
      const payload = await getAllProductsSelect({
        ...buildParams(),
        search: searchValue,
      });
      const data = applyMultiSearchFilter(normalizeProductsResponse(payload));

      if (!data.length) {
        toast.info(
          searchValue
            ? "No products matched your search"
            : "No products to export with current filters",
        );
        return;
      }

      const exportData = buildExportData(data);
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `export-search-${Date.now()}.xlsx`,
      );
      toast.success("Export with search completed");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };
      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to export with search";
      toast.error("Export with search failed", {
        description: String(message),
      });
    } finally {
      setExportingAction(null);
    }
  };

  const handleExportCSV = async () => {
    setExportingAction("csv");
    try {
      const res = await refetch();
      const data = applyMultiSearchFilter(normalizeProductsResponse(res.data));
      if (!data.length) {
        toast.info("No products to export");
        return;
      }

      const exportData = buildExportData(data);

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const csv = XLSX.utils.sheet_to_csv(worksheet, {
        FS: ",", // ✅ COMMA
        RS: "\n",
        forceQuotes: true, // ✅ vì description có dấu phẩy
        blankrows: false,
      });

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      saveAs(blob, `export-${Date.now()}.csv`);
    } finally {
      setExportingAction(null);
    }
  };

  const handleExportCSVForPraktiker = async () => {
    setExportingAction("praktiker");
    try {
      const res = await refetch();
      const data = applyMultiSearchFilter(normalizeProductsResponse(res.data));
      if (!data.length) {
        toast.info("No products to export");
        return;
      }

      const inStockProducts = data.filter(
        (product) =>
          calculateAvailableStock(product) > 0 &&
          Array.isArray(product.static_files) &&
          product.static_files.length > 0 &&
          product.final_price,
      );

      if (!inStockProducts.length) {
        toast.info("No products with stock > 0 and images to export");
        return;
      }

      const exportData = buildExportData(inStockProducts, "///");

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const csv = XLSX.utils.sheet_to_csv(worksheet, {
        FS: ",",
        RS: "\n",
        forceQuotes: true,
        blankrows: false,
      });

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      saveAs(blob, `export-praktiker-${Date.now()}.csv`);
    } finally {
      setExportingAction(null);
    }
  };

  return (
    <div>
      {/* Export Button */}
      <div className="flex justify-start gap-2">
        <Button
          onClick={handleExportExcel}
          disabled={isAnyExporting}
          type="button"
        >
          {exportingAction === "excel" ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Export Excel"
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={handleExportCSV}
          disabled={isAnyExporting}
          type="button"
        >
          {exportingAction === "csv" ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Export CSV"
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={handleExportCSVForPraktiker}
          disabled={isAnyExporting}
          type="button"
        >
          {exportingAction === "praktiker" ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Export for Praktiker"
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleExportExcelWithSearch}
          disabled={isAnyExporting}
          type="button"
        >
          {exportingAction === "search" ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Export with search"
          )}
        </Button>
      </div>
    </div>
  );
};

export default FilterExportForm;
