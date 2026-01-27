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

  const handleExport = async () => {
    const res = await refetch();
    const data = res.data;

    if (!data?.length) return;

    const clean = (val: any) => (val === null || val === undefined ? "" : val);

    const exportData = data.map((p) => {
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
        supplier_name: clean(p.owner?.business_name),
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
        log_height: clean(p.packages?.reduce((s, q) => s + (q.height || 0), 0)),
        log_width: clean(p.packages?.reduce((s, q) => s + (q.width || 0), 0)),
        log_length: clean(p.packages?.reduce((s, q) => s + (q.length || 0), 0)),
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
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "export.xlsx");
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
          <RadioGroup
            value={status}
            onValueChange={(v) => setStatus(v as any)}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="active"
                id="status-active"
              />
              <Label htmlFor="status-active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="inactive"
                id="status-inactive"
              />
              <Label htmlFor="status-inactive">Inactive</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="all"
                id="status-all"
              />
              <Label htmlFor="status-all">All</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={isFetching}
        >
          {isFetching ? <Loader2 className="animate-spin" /> : "Export Excel"}
        </Button>
      </div>
    </div>
  );
};

export default FilterExportForm;
