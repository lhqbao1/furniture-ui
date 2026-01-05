"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { Loader2 } from "lucide-react";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useQuery } from "@tanstack/react-query";
import { getAllProductsSelect } from "@/features/product-group/api";
import { getAllCheckOutMain } from "@/features/checkout/api";
import { getStatusStyle } from "./status-styles";
import { calculateOrderTaxWithDiscount } from "@/lib/caculate-vat";
import { CheckOutMain } from "@/types/checkout";
import { formatDateDE } from "@/lib/format-date-DE";
import { formatDateString } from "@/lib/date-formated";

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

function getPrimaryCheckout(p: CheckOutMain) {
  if (!Array.isArray(p.checkouts)) return undefined;

  return p.checkouts.find((c) => c.invoice_address) ?? p.checkouts[0];
}

export default function ExportOrderExcelButton() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["checkout-main-all"],
    queryFn: () => getAllCheckOutMain(),
    enabled: false, // ❌ không auto call
  });

  const handleExport = async () => {
    const res = await refetch(); // 🔥 gọi API tại đây
    const data = res.data;

    if (!data || data.length === 0) return;

    // Hàm xử lý giá trị null / undefined / "None"
    const clean = (val: any) =>
      val === null || val === undefined || val === "None" ? "" : val;

    const exportData = data.map((p) => {
      const checkout = getPrimaryCheckout(p);
      const invoice = checkout?.invoice_address;
      const shipping = checkout?.shipping_address;
      const user = checkout?.user;
      const allItems = p.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [];

      return {
        code: clean(p.checkout_code),
        status: clean(getStatusStyle(p.status).text),
        date: clean(formatDateString(p.created_at)),
        note: clean(p.note ?? ""),
        shipping_cost: clean(p.total_shipping),

        // ===== ITEMS (flatMap nhưng gộp) =====
        product_names: clean(
          allItems
            .map((i) => i.products.name)
            .filter(Boolean)
            .join(" | "),
        ),
        total_quantity: allItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0),

        total_amount: calculateOrderTaxWithDiscount(
          p.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [],
          p?.voucher_amount,
          shipping?.country ?? "DE",
          user?.tax_id,
        ).totalGross.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),

        marketplace: clean(p.from_marketplace),
        marketplace_order_id: clean(p.marketplace_order_id),
        payment_method: clean(p.payment_method),

        // -------- Invoice --------
        invoice_name: clean(invoice?.recipient_name ?? ""),
        invoice_company_name: clean(user?.company_name ?? ""),
        invoice_tax_number: clean(user?.tax_id ?? ""),
        invoice_phone_number: clean(invoice?.phone_number ?? ""),
        invoice_address: clean(invoice?.address_line ?? ""),
        invoice_additional_address: clean(
          invoice?.additional_address_line ?? "",
        ),
        invoice_city: clean(invoice?.city ?? ""),
        invoice_postal_code: clean(invoice?.postal_code ?? ""),
        invoice_country: clean(invoice?.country ?? ""),

        // -------- Shipping --------
        recipient_name: clean(shipping?.recipient_name ?? ""),
        recipient_phone_number: clean(shipping?.phone_number ?? ""),
        shipping_address: clean(shipping?.address_line ?? ""),
        shipping_additional_address: clean(
          shipping?.additional_address_line ?? "",
        ),
        shipping_city: clean(shipping?.city ?? ""),
        shipping_postal_code: clean(shipping?.postal_code ?? ""),
        shipping_country: clean(shipping?.country ?? ""),

        carrier: clean(
          checkout?.shipment ? checkout.shipment.shipping_carrier : "",
        ),
        shipping_date: clean(
          checkout?.shipment
            ? formatDateString(checkout.shipment.shipper_date)
            : "",
        ),
      };
    });

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
      {isFetching ? <Loader2 className="animate-spin" /> : "Order Export"}
    </Button>
  );
}
