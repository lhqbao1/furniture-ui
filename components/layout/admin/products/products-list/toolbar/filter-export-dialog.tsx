"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllProductsSelect } from "@/features/product-group/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useGetSuppliers } from "@/features/supplier/hook";
import SupplierSelect from "./supplier-select";
import { SupplierResponse } from "@/types/supplier";
import { ProductItem, StaticFile } from "@/types/products";

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

const normalizeDescription = (html?: string) => {
  if (!html) return "";

  return (
    html
      // bỏ newline
      .replace(/\r?\n|\r/g, " ")

      // đổi <br>, <p>, <li>, <h*> thành space
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?(p|div|li|ul|h\d)[^>]*>/gi, " ")

      // dọn HTML còn sót
      .replace(/<[^>]+>/g, "")

      // dọn khoảng trắng
      .replace(/\s+/g, " ")
      .trim()
  );
};

const FilterExportForm = () => {
  const [supplier, setSupplier] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("all");

  const buildParams = () => {
    const params: any = {};

    if (status === "active") {
      params.all_products = true;
    } else if (status === "inactive") {
      params.all_products = false;
    }
    // status === "all" => không set all_products

    if (supplier) {
      params.supplier_id = supplier === "" ? undefined : supplier;
    }

    return params;
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["all-products", supplier, status],
    queryFn: () => getAllProductsSelect(buildParams()),
    enabled: false,
  });

  const { data: suppliers, isLoading, isError } = useGetSuppliers();
  if (!suppliers) return <>Loading...</>;

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

      return {
        id: Number(clean(p.id_provider)),
        ean: clean(p.ean),
        status: p.is_active === true ? "ACTIVE" : "INACTIVE",
        brand_name: clean(p.brand?.name),
        supplier_name: clean(p.owner?.business_name) ?? "Prestige Home",
        manufacturer_sku: clean(p.sku),
        manufacturing_country: clean(p.manufacture_country),
        // customs_tariff_nr: Number.isFinite(tariff) ? tariff : "",
        name: clean(p.name),
        description: normalizeDescription(p.description),
        technical_description: normalizeDescription(p.description),
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
        vat: vat ?? "",
        stock: clean(p.stock),
        img_url: clean(
          p.static_files
            ?.map((f: StaticFile) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        product_link: `https://www.prestige-home.de/de/product/${p.url_key}`,
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

  // Add prestige home option
  const extendedSuppliers: SupplierResponse[] = [
    {
      id: "",
      business_name: "All",
      delivery_multiple: false,
      vat_id: "",
      email: "",
      email_order: "",
      email_billing: "",
      phone_number: "",
      created_at: "",
      updated_at: "",
    },
    {
      id: "prestige_home",
      business_name: "Prestige Home",
      delivery_multiple: false,
      vat_id: "",
      email: "",
      email_order: "",
      email_billing: "",
      phone_number: "",
      created_at: "",
      updated_at: "",
    },
    ...suppliers,
  ];

  return (
    <div>
      <div className="space-y-4">
        {/* Supplier Filter */}
        {suppliers && (
          <SupplierSelect
            suppliers={extendedSuppliers}
            supplier={supplier}
            setSupplier={setSupplier}
          />
        )}

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <RadioGroup value={status} onValueChange={(v) => setStatus(v as any)}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="inactive" id="status-inactive" />
              <Label htmlFor="status-inactive">Inactive</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all">All</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end gap-2">
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
      </div>
    </div>
  );
};

export default FilterExportForm;
