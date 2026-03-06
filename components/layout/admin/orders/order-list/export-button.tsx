"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { Loader2 } from "lucide-react";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useQuery } from "@tanstack/react-query";
import { getAllCheckOutMain } from "@/features/checkout/api";
import { getStatusStyle } from "./status-styles";
import { calculateOrderTaxWithDiscount } from "@/lib/caculate-vat";
import { CheckOutMain } from "@/types/checkout";
import { formatDateDE } from "@/lib/format-date-DE";
import { formatDateDDMMYYYY, formatDateString } from "@/lib/date-formated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import { CHANEL_OPTIONS } from "./filter/filter-order-chanel";
import { STATUS_OPTIONS } from "@/data/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [marketplace, setMarketplace] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const hasFilters = marketplace !== "" || selectedStatus.length > 0;

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["checkout-main-all", marketplace, selectedStatus.join(",")],
    queryFn: () => getAllCheckOutMain(marketplace, selectedStatus),
    enabled: false, // ❌ không auto call
  });

  const toggleStatus = (item: (typeof STATUS_OPTIONS)[number]) => {
    const backendStatuses = item.statuses ?? [item.key];
    const isSelected = backendStatuses.every((status) =>
      selectedStatus.includes(status),
    );

    if (isSelected) {
      setSelectedStatus((prev) =>
        prev.filter((status) => !backendStatuses.includes(status)),
      );
      return;
    }

    setSelectedStatus((prev) =>
      Array.from(new Set([...prev, ...backendStatuses])),
    );
  };

  const getExportFileName = (marketplace: string) => {
    if (!marketplace) return "order_export.xlsx";

    return `order_export_${marketplace}.xlsx`;
  };

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
        marketplace: clean(p.from_marketplace),
        marketplace_order_id: clean(p.marketplace_order_id),
        date: clean(formatDateDDMMYYYY(p.created_at)),
        status: clean(getStatusStyle(p.status).text),
        payment_method: clean(p.payment_method),
        note: clean(p.note ?? ""),
        product_names: clean(
          allItems
            .map((i) => i.products.name)
            .filter(Boolean)
            .join(" | "),
        ),
        total_quantity: allItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
        shipping_cost: clean(p.total_shipping),
        discount_amout: clean(p.voucher_amount),
        total_amount: clean(p.total_amount),

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
        suppliers: clean(
          allItems
            .map((i) =>
              i.products.owner && i.products.owner.business_name
                ? i.products.owner.business_name
                : "Prestige Home",
            )
            .filter(Boolean)
            .join(" | "),
        ),
        shipping_date: clean(
          checkout?.shipment
            ? formatDateDDMMYYYY(checkout.shipment.shipper_date)
            : "",
        ),
        tracking_number: clean(
          checkout?.shipment && checkout.shipment.tracking_number
            ? checkout.shipment.tracking_number
            : "",
        ),
        shipping_code: clean(
          checkout?.shipment && checkout.shipment.ship_code
            ? checkout.shipment.ship_code
            : "",
        ),
        // delivery_order_id: clean(
        //  checkout.
        // ),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ép TEXT cho các cột đã chốt
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, getExportFileName(marketplace));
  };

  const handleResetFilters = () => {
    setMarketplace("");
    setSelectedStatus([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Export Orders</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-3 space-y-4">
        {/* Marketplace Filter */}
        <div className="space-y-2">
          <Label>Chanel</Label>

          <Select value={marketplace} onValueChange={setMarketplace}>
            <SelectTrigger placeholderColor className="border">
              <SelectValue placeholder="All Chanel" />
            </SelectTrigger>
            <SelectContent>
              {CHANEL_OPTIONS.map((item) => (
                <SelectItem key={item.key} value={item.key}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Status</Label>
          <Select>
            <SelectTrigger className="border">
              <SelectValue placeholder="Choose status" />
            </SelectTrigger>
            <SelectContent className="max-h-96">
              {STATUS_OPTIONS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-md"
                  onClick={() => toggleStatus(item)}
                >
                  <Checkbox
                    checked={
                      item.statuses
                        ? item.statuses.every((status) =>
                            selectedStatus.includes(status),
                          )
                        : selectedStatus.includes(item.key)
                    }
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!hasFilters || isFetching}
            >
              Reset Filters
            </Button>

            <Button onClick={handleExport} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Export Excel"
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
