"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

export default function ExportExampleOrderExcelButton() {
  const handleExport = () => {
    const exportData = [
      {
        marketplace_order_id: "Number",
        first_name: "Text",
        last_name: "Text",
        recipient_name: "Text",
        email_shipping: "Email",
        phone: "Number",
        address: "House number + street",
        postal_code: "Postal code",
        city: "City",
        country: "Country Code (ex: DE, AT)",
        status: "PAID or PENDING",
        title: "Product name",
        id_provider: "Product ID",
        quantity: "Number",
        final_price: "Net Price",
        total_shipping: "Enter for customize or depends on product's carrier",
        vat: "For Product Price calculation",
      },
      {
        marketplace_order_id: "6659554",
        first_name: "Nicole",
        last_name: "Willmerding",
        recipient_name: "TexNicole Willmerdingt",
        email_shipping: "willmerding@t-online.de",
        phone: "01752131769",
        address: "77 Hambrocker Str.",
        postal_code: "29525",
        city: "Uelzen",
        country: "DE",
        status: "PAID",
        title:
          "Diesel Stromerzeuger PWDG52-5000 Notstromaggregat Generator 4-Takt 5000W E-Start",
        id_provider: "1000265",
        quantity: "1",
        final_price: "740",
        total_shipping: "10",
        vat: "19%",
      },
    ];

    const headers = [
      { label: "marketplace_order_id", key: "marketplace_order_id" },
      { label: "first_name", key: "first_name" },
      { label: "last_name", key: "last_name" },
      { label: "recipient_name", key: "recipient_name" },
      { label: "email_shipping", key: "email_shipping" },
      { label: "phone", key: "phone" },
      { label: "address", key: "address" },
      { label: "postal_code", key: "postal_code" },
      { label: "city", key: "city" },
      { label: "country", key: "country" },
      { label: "status", key: "status" },
      { label: "title", key: "title" },
      { label: "id_provider", key: "id_provider" },
      { label: "quantity", key: "quantity" },
      { label: "final_price", key: "final_price" },
      { label: "total_shipping", key: "total_shipping" },
      { label: "vat", key: "vat" },
    ];

    // 1️⃣ Create worksheet with correct key order
    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      header: headers.map((h) => h.key),
    });

    // 2️⃣ Rename header row
    headers.forEach((h, index) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cell]) {
        worksheet[cell].v = h.label;
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Example");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "example-import-template.xlsx",
    );
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      className="w-fit"
    >
      Export Sample
    </Button>
  );
}
