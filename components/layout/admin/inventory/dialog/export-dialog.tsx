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
import { SupplierResponse } from "@/types/supplier";
import SupplierSelect from "../../products/products-list/toolbar/supplier-select";

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

const ExportInventoryDialog = () => {
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

    const exportData = data.map((p) => ({
      id: p.id_provider ?? undefined, // text
      name: p.name ?? undefined, // text
      ean: p.ean ?? undefined, // text
      sku: p.sku ?? undefined, // text
      supplier: p.owner?.business_name ?? undefined, // text

      // === cost & price ===
      net_purchase_cost: typeof p.cost === "number" ? p.cost : undefined,

      sale_price: typeof p.final_price === "number" ? p.final_price : undefined,

      // === stock === (value)
      available_stock:
        typeof p.stock === "number"
          ? p.stock - (p.result_stock ?? 0)
          : undefined,

      reserved_stock:
        typeof p.result_stock === "number" ? p.result_stock : undefined,

      physical_stock: typeof p.stock === "number" ? p.stock : undefined,

      // === purchase value ===
      available_purchase_value:
        typeof p.cost === "number" && typeof p.stock === "number"
          ? (p.stock - (p.result_stock ?? 0)) * p.cost
          : undefined,

      reserved_purchase_value:
        typeof p.cost === "number" && typeof p.result_stock === "number"
          ? p.result_stock * p.cost
          : undefined,

      physical_purchase_value:
        typeof p.cost === "number" && typeof p.stock === "number"
          ? p.stock * p.cost
          : undefined,

      // === sale value ===
      available_sale_value:
        typeof p.final_price === "number" && typeof p.stock === "number"
          ? (p.stock - (p.result_stock ?? 0)) * p.final_price
          : undefined,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    forceTextColumns(worksheet, ["A", "B", "C", "D", "E"]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "export-inventory.xlsx");
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

export default ExportInventoryDialog;
