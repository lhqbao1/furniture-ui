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

const FilterExportForm = () => {
  const [isExportingSearch, setIsExportingSearch] = useState(false);
  const searchParams = useSearchParams();
  const supplierId = searchParams.get("supplier_id") ?? "";
  const statusParam = searchParams.get("all_products");

  const buildParams = () => {
    const params: any = {};

    if (statusParam === "true") {
      params.all_products = true;
    } else if (statusParam === "false") {
      params.all_products = false;
    }

    if (supplierId) {
      params.supplier_id = supplierId;
    }

    return params;
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["all-products", supplierId, statusParam ?? "all"],
    queryFn: () => getAllProductsSelect(buildParams()),
    enabled: false,
  });

  const buildExportData = (data: ProductItem[]) => {
    const clean = (val: any) => (val === null || val === undefined ? "" : val);

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
        marketplaces: any[] | undefined,
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
        ean: clean(p.ean),
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
        vat: vat,
        stock: clean(calculateAvailableStock(p)),
        img_url: clean(
          p.static_files?.map((f) => f.url.replaceAll(" ", "%20")).join("|"),
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

  const handleExportExcel = async () => {
    const res = await refetch();
    const data = res.data;
    if (!data?.length) return;

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
  };

  const handleExportExcelWithSearch = async () => {
    const search = searchParams.get("search") ?? undefined;
    setIsExportingSearch(true);
    try {
      const data = await getAllProductsSelect({ search });
      console.log(data);
      console.log(search);
      if (!data?.length) return;

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
    } finally {
      setIsExportingSearch(false);
    }
  };

  const handleExportCSV = async () => {
    const res = await refetch();
    const data = res.data;
    if (!data?.length) return;

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
  };

  return (
    <div>
      {/* Export Button */}
      <div className="flex justify-start gap-2">
        <Button onClick={handleExportExcel} disabled={isFetching} type="button">
          {isFetching ? <Loader2 className="animate-spin" /> : "Export Excel"}
        </Button>

        <Button
          variant="secondary"
          onClick={handleExportCSV}
          disabled={isFetching}
          type="button"
        >
          Export CSV
        </Button>

        <Button
          variant="outline"
          onClick={handleExportExcelWithSearch}
          disabled={isFetching || isExportingSearch}
          type="button"
        >
          {isExportingSearch ? (
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
