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

const DSPriceExport = () => {
  const [status, setStatus] = useState<"active" | "inactive" | "all">("all");

  const buildParams = () => {
    const params: any = {};

    params.supplier_id = "prestige_home";

    if (status === "active") {
      params.all_products = true;
    } else if (status === "inactive") {
      params.all_products = false;
    }
    // status === "all" => không set all_products
    return params;
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["all-products", status],
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
      id: clean(p.id_provider),
      name: clean(p.name),
      manufacturer_sku: clean(p.sku),
      ean: clean(p.ean),
      physical_stock: clean(p.stock),
      available_stock: clean(p.stock - Math.abs(p.result_stock ?? 0)),
      carrier: clean(p.carrier),
      delivery_charge: clean(p.delivery_charge),
      net_purchase_cost: clean(p.cost),
      ds_price: clean(p.ds_price),
      markup: clean(
        p.ds_price ? (((p.ds_price - p.cost) / p.cost) * 100).toFixed(2) : "",
      ),
    }));

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

export default DSPriceExport;
