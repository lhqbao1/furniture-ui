"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { CheckOut } from "@/types/checkout";

export default function ExportExcelButton({ data }: { data: CheckOut[] }) {
  const handleExport = () => {
    // Hàm xử lý giá trị null / undefined / "None"
    const clean = (val: any) =>
      val === null || val === undefined || val === "None" ? "" : val;

    const exportData = data.map((p) => ({
      id: clean(p.checkout_code),
      date_created: clean(p.created_at),
      ship_to_name: clean(
        p.user.company_name
          ? p.user.company_name
          : p.shipping_address.recipient_name,
      ),
      ship_to_country: clean(p.shipping_address.country),
      ship_to_postal_code: clean(p.shipping_address.postal_code),
      ship_to_city: clean(p.shipping_address.city),
      status: clean(p.shipment.status),
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

  return (
    <Button
      variant={"secondary"}
      onClick={handleExport}
    >
      Export Excel
    </Button>
  );
}
