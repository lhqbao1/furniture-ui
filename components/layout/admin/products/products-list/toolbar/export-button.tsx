"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllProductsSelect } from "@/features/product-group/api";

function forceTextColumns(worksheet: XLSX.WorkSheet, columns: string[]) {
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    columns.forEach((c) => {
      const addr = `${c}${r + 1}`;
      if (worksheet[addr]) {
        worksheet[addr].t = "s"; // string
        worksheet[addr].z = "@"; // TEXT format (QUAN TRỌNG)
      }
    });
  }
}

export default function ExportExcelButton() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["all-products"],
    queryFn: () => getAllProductsSelect({}),
    enabled: false, // ❌ không auto call
  });

  const handleExport = async () => {
    const res = await refetch(); // 🔥 gọi API tại đây
    const data = res.data;

    if (!data || data.length === 0) return;

    // Hàm xử lý giá trị null / undefined / "None"
    const clean = (val: any) => (val === null || val === undefined ? "" : val);

    const exportData = data
      // .filter((p) => p.is_active === true)
      .map((p) => ({
        id: clean(p.id_provider),
        ean: clean(p.ean),
        status: p.is_active === true ? "ACTIVE" : "INACTIVE",
        brand_name: clean(p.brand?.name),
        supplier_name: clean(p.owner?.business_name),
        manufacturer_sku: clean(p.sku),
        manufacturing_country: clean(p.manufacture_country),
        customs_tariff_nr: clean(p.tariff_number),
        name: clean(p.name),
        description: clean(p.description),
        technical_description: clean(p.technical_description),
        categories: clean(p.categories?.map((c) => c.code).join(", ")),
        category_name: clean(p.categories?.map((c) => c.name).join(", ")),
        unit: clean(p.unit),
        amount_unit: clean(p.amount_unit),
        delivery_time: clean(p.delivery_time),
        carrier: clean(p.carrier),
        net_purchase_cost: clean(p.cost),
        delivery_cost: clean(p.delivery_cost),
        return_cost: clean(p.return_cost),
        original_price: clean(p.price),
        sale_price: clean(p.final_price),
        vat: clean(p.tax),
        stock: clean(p.stock),
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
        log_height: clean(
          p.packages?.reduce((sum, pkg) => sum + (pkg.height || 0), 0),
        ),
        log_width: clean(
          p.packages?.reduce((sum, pkg) => sum + (pkg.width || 0), 0),
        ),
        log_length: clean(
          p.packages?.reduce((sum, pkg) => sum + (pkg.length || 0), 0),
        ),
        log_weight: clean(
          p.packages?.reduce((sum, pkg) => sum + (pkg.weight || 0), 0),
        ),
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
        product_link: p.brand
          ? p.brand.name.toLowerCase() === "econelo"
            ? `https://prestige-home.de/de/product/${p.url_key}`
            : `https://econelo.de/produkt/${p.url_key}`
          : `https://prestige-home.de/de/product/${p.url_key}`,
      }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ép TEXT cho các cột đã chốt
    forceTextColumns(worksheet, ["A", "B", "G", "K", "N"]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "export.xlsx");
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isFetching}
    >
      {isFetching ? <Loader2 className="animate-spin" /> : "Product Export"}
    </Button>
  );
}
