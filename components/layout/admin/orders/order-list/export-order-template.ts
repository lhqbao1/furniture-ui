"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getStatusStyle } from "./status-styles";
import { CheckOutMain } from "@/types/checkout";
import { formatDateDDMMYYYY } from "@/lib/date-formated";

function getPrimaryCheckout(order: CheckOutMain) {
  if (!Array.isArray(order.checkouts)) return undefined;
  return order.checkouts.find((checkout) => checkout.invoice_address) ?? order.checkouts[0];
}

function clean(val: unknown) {
  return val === null || val === undefined || val === "None" ? "" : val;
}

export function mapOrderListTemplateRows(data: CheckOutMain[]) {
  return data.flatMap((order) => {
    const checkout = getPrimaryCheckout(order);
    const invoice = checkout?.invoice_address;
    const shipping = checkout?.shipping_address;
    const user = checkout?.user;
    const allItems = order.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [];

    const buyerAddressRow = {
      invoice_name: clean(invoice?.recipient_name ?? ""),
      invoice_company_name: clean(user?.company_name ?? ""),
      invoice_tax_number: clean(user?.tax_id ?? ""),
      invoice_phone_number: clean(invoice?.phone_number ?? ""),
      invoice_address: clean(invoice?.address_line ?? ""),
      invoice_additional_address: clean(invoice?.additional_address_line ?? ""),
      invoice_city: clean(invoice?.city ?? ""),
      invoice_postal_code: clean(invoice?.postal_code ?? ""),
      invoice_country: clean(invoice?.country ?? ""),

      recipient_name: clean(shipping?.recipient_name ?? ""),
      recipient_phone_number: clean(shipping?.phone_number ?? ""),
      shipping_address: clean(shipping?.address_line ?? ""),
      shipping_additional_address: clean(shipping?.additional_address_line ?? ""),
      shipping_city: clean(shipping?.city ?? ""),
      shipping_postal_code: clean(shipping?.postal_code ?? ""),
      shipping_country: clean(shipping?.country ?? ""),
    };

    return [
      {
        code: clean(order.checkout_code),
        marketplace: clean(order.from_marketplace ?? "Prestige Home"),
        marketplace_order_id: clean(order.marketplace_order_id),
        date: clean(formatDateDDMMYYYY(order.created_at)),
        status: clean(getStatusStyle(order.status).text),
        payment_method: clean(order.payment_method),
        note: clean(order.note ?? ""),
        product_id: clean(
          allItems
            .map((i) => i.products.id_provider)
            .filter(Boolean)
            .join(" | "),
        ),
        product_names: clean(
          allItems
            .map((i) => i.products.name)
            .filter(Boolean)
            .join(" | "),
        ),
        total_quantity: allItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
        shipping_cost: clean(order.total_shipping),
        discount_amout: clean(order.voucher_amount),
        total_amount: clean(order.total_amount),
        ...buyerAddressRow,
        carrier: clean(checkout?.shipment?.shipping_carrier ?? ""),
        suppliers: clean(
          allItems
            .map((i) =>
              i.products.owner?.business_name
                ? i.products.owner.business_name
                : "Prestige Home",
            )
            .filter(Boolean)
            .join(" | "),
        ),
        shipping_date: clean(
          checkout?.shipment?.shipper_date
            ? formatDateDDMMYYYY(checkout.shipment.shipper_date)
            : "",
        ),
        tracking_number: clean(checkout?.shipment?.tracking_number ?? ""),
        shipping_code: clean(checkout?.shipment?.ship_code ?? ""),
      },
    ];
  });
}

export function exportOrderListTemplateToExcel(
  data: CheckOutMain[],
  fileName = "order_export.xlsx",
) {
  if (!Array.isArray(data) || data.length === 0) return;

  const rows = mapOrderListTemplateRows(data);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}

