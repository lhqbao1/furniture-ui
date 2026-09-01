"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getStatusStyle } from "./status-styles";
import { CheckOutMain } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { formatDateDDMMYYYY } from "@/lib/date-formated";
import { calculateProductVAT } from "@/lib/caculate-vat";
import { formatDeliveryRangeLabel } from "./delivery-range";

const EXCLUDED_EXCHANGE_CHECKOUT_STATUSES = new Set([
  "exchange",
  "cancel_exchange",
  "exchange_stock_reserved",
  "exchange_shipped",
  "exchange_preparation_shipping",
  "exchange_cancel_no_stock",
]);

function isExcludedExchangeCheckoutStatus(status?: string | null) {
  return EXCLUDED_EXCHANGE_CHECKOUT_STATUSES.has(
    String(status ?? "")
      .toLowerCase()
      .trim(),
  );
}

function getExportableCheckouts(order: CheckOutMain) {
  if (!Array.isArray(order.checkouts)) return [];
  return order.checkouts.filter(
    (checkout) => !isExcludedExchangeCheckoutStatus(checkout.status),
  );
}

function getPrimaryCheckout(order: CheckOutMain) {
  const checkouts = getExportableCheckouts(order);
  return checkouts.find((checkout) => checkout.invoice_address) ?? checkouts[0];
}

function clean(val: unknown) {
  return val === null || val === undefined || val === "None" ? "" : val;
}

function getExternalReference(order: CheckOutMain) {
  return (
    (order as CheckOutMain & { netto_buyer?: string | null }).netto_buyer ??
    order.netto_buyer_id ??
    ""
  );
}

function formatOrderTags(order: CheckOutMain) {
  const tags = Array.isArray(order.tags)
    ? order.tags.map((item) => String(item?.tag ?? "").trim()).filter(Boolean)
    : [];

  return Array.from(new Set(tags)).join(" | ");
}

function calculateOrderNetValues(order: CheckOutMain) {
  const checkout = getPrimaryCheckout(order);
  const countryCode =
    checkout?.shipping_address?.country ??
    checkout?.invoice_address?.country ??
    "DE";
  const taxId = checkout?.user?.tax_id ?? "";
  const allItems = getExportableCheckouts(order).flatMap(
    (c) => c.cart?.items ?? [],
  );
  const linePricings = allItems.map((item) => {
    const quantity = Number(item?.quantity) || 0;
    const unitGross =
      Number(
        item?.purchased_products?.final_price ??
          item?.products?.final_price ??
          item?.final_price ??
          item?.item_price ??
          0,
      ) || 0;
    const taxValue =
      // Keep export aligned with order details table logic.
      item?.products?.tax ?? item?.purchased_products?.tax ?? null;
    const vatResult = calculateProductVAT(
      unitGross,
      taxValue,
      countryCode,
      taxId,
    );
    const vatRate = Number(vatResult.vatRate) || 0;
    const lineGross = +(unitGross * quantity).toFixed(2);
    const lineNet = +(Number(vatResult.net) * quantity).toFixed(2);

    return {
      vatRate,
      lineGross,
      lineNet,
    };
  });

  const netAmount = linePricings.reduce((sum, line) => sum + line.lineNet, 0);

  const shippingGross = Math.max(0, Number(order.total_shipping) || 0);
  const grossByVatRate = linePricings.reduce((acc, line) => {
    if (line.lineGross <= 0) return acc;
    const key = line.vatRate;
    acc.set(key, +(Number(acc.get(key) || 0) + line.lineGross).toFixed(2));
    return acc;
  }, new Map<number, number>());

  let shippingNet = 0;
  const productBuckets = Array.from(grossByVatRate.entries())
    .map(([vatRate, gross]) => ({
      vatRate,
      gross: +(Number(gross) || 0).toFixed(2),
    }))
    .filter((bucket) => bucket.gross > 0);

  if (shippingGross > 0) {
    if (productBuckets.length === 0) {
      shippingNet = +calculateProductVAT(
        shippingGross,
        "19%",
        countryCode,
        taxId,
      ).net.toFixed(2);
    } else {
      const totalProductGross = +productBuckets
        .reduce((sum, bucket) => sum + bucket.gross, 0)
        .toFixed(2);
      let remainingGross = +shippingGross.toFixed(2);

      productBuckets.forEach((bucket, index) => {
        const isLast = index === productBuckets.length - 1;
        let allocatedGross = isLast
          ? remainingGross
          : +((shippingGross * bucket.gross) / totalProductGross).toFixed(2);

        allocatedGross = Math.max(
          0,
          Math.min(+remainingGross.toFixed(2), allocatedGross),
        );
        remainingGross = +(remainingGross - allocatedGross).toFixed(2);

        const lineShippingNet = +(
          allocatedGross /
          (1 + bucket.vatRate)
        ).toFixed(2);
        shippingNet = +(shippingNet + lineShippingNet).toFixed(2);
      });

      if (remainingGross > 0) {
        const fallbackRate = productBuckets[productBuckets.length - 1].vatRate;
        const fallbackShippingNet = +(
          remainingGross /
          (1 + fallbackRate)
        ).toFixed(2);
        shippingNet = +(shippingNet + fallbackShippingNet).toFixed(2);
      }
    }
  }

  return {
    netAmount: +netAmount.toFixed(2),
    shippingNet: +Number(shippingNet || 0).toFixed(2),
  };
}

function getCartItemUnitGross(item?: CartItem) {
  return (
    Number(
      item?.purchased_products?.final_price ??
        item?.products?.final_price ??
        item?.final_price ??
        item?.item_price ??
        0,
    ) || 0
  );
}

function getCartItemExportValues(
  item: CartItem | undefined,
  countryCode: string,
  taxId: string,
) {
  const quantity = Number(item?.quantity) || 0;
  const unitGross = getCartItemUnitGross(item);
  const taxValue = item?.products?.tax ?? item?.purchased_products?.tax ?? null;
  const vatResult = calculateProductVAT(
    unitGross,
    taxValue,
    countryCode,
    taxId,
  );
  const unitNet = +Number(vatResult.net || 0).toFixed(2);
  const lineGross = +(unitGross * quantity).toFixed(2);
  const lineNet = +(unitNet * quantity).toFixed(2);
  const taxRate = +((Number(vatResult.vatRate) || 0) * 100).toFixed(2);
  const productCost = +((Number(item?.products?.cost) || 0) * quantity).toFixed(
    2,
  );
  const freightCost = +(
    (Number(item?.products?.delivery_cost) || 0) * quantity
  ).toFixed(2);

  return {
    quantity,
    unitGross,
    unitNet,
    lineGross,
    lineNet,
    taxRate,
    productCost,
    freightCost,
  };
}

export function mapOrderListTemplateRows(data: CheckOutMain[]) {
  return data.flatMap((order) => {
    const hasChildCheckouts =
      Array.isArray(order.checkouts) && order.checkouts.length > 0;
    const exportableCheckouts = getExportableCheckouts(order);
    if (hasChildCheckouts && exportableCheckouts.length === 0) return [];

    const checkout = getPrimaryCheckout(order);
    const invoice = checkout?.invoice_address;
    const shipping = checkout?.shipping_address;
    const user = checkout?.user;
    const allItems = exportableCheckouts.flatMap((c) => c.cart?.items ?? []);
    const { netAmount, shippingNet } = calculateOrderNetValues(order);
    const countryCode = shipping?.country ?? invoice?.country ?? "DE";
    const taxId = user?.tax_id ?? "";
    const rowItems: Array<CartItem | undefined> =
      allItems.length > 0 ? allItems : [undefined];

    const buyerAddressRow = {
      invoice_name: clean(invoice?.recipient_name ?? ""),
      invoice_company_name: clean(user?.company_name ?? ""),
      invoice_tax_number: clean(user?.tax_id ?? ""),
      invoice_phone_number: clean(invoice?.phone_number ?? ""),
      invoice_email: clean(user?.email ?? ""),

      invoice_address: clean(invoice?.address_line ?? ""),
      invoice_additional_address: clean(invoice?.additional_address_line ?? ""),
      invoice_city: clean(invoice?.city ?? ""),
      invoice_postal_code: clean(invoice?.postal_code ?? ""),
      invoice_country: clean(invoice?.country ?? ""),

      recipient_name: clean(shipping?.recipient_name ?? ""),
      recipient_phone_number: clean(shipping?.phone_number ?? ""),
      email_shipping: clean(shipping?.email ?? ""),
      shipping_address: clean(shipping?.address_line ?? ""),
      shipping_additional_address: clean(
        shipping?.additional_address_line ?? "",
      ),
      shipping_city: clean(shipping?.city ?? ""),
      shipping_postal_code: clean(shipping?.postal_code ?? ""),
      shipping_country: clean(shipping?.country ?? ""),
    };

    const orderRow = {
      id: clean(order.id ?? ""),
      code: clean(order.checkout_code),
      marketplace: clean(order.from_marketplace ?? "Prestige Home"),
      netto_buyer: clean(getExternalReference(order)),
      marketplace_order_id: clean(order.marketplace_order_id),
      ext_invoice_id: clean(order.ext_invoice_id ?? ""),
      date: clean(formatDateDDMMYYYY(order.created_at)),
      estimated_delivery: clean(
        formatDeliveryRangeLabel(order.delivery_from, order.delivery_to),
      ),
      status: clean(getStatusStyle(order.status).text),
      tag: clean(formatOrderTags(order)),
      payment_method: clean(order.payment_method),
      note: clean(order.note ?? ""),
      discount_amout: clean(order.voucher_amount),
      total_amount: clean(order.total_amount),
      net_amount: clean(netAmount),
      shipping_amount: clean(shippingNet),
      ...buyerAddressRow,
      carrier: clean(checkout?.shipment?.shipping_carrier ?? ""),
      shipping_date: clean(
        checkout?.shipment?.shipper_date
          ? formatDateDDMMYYYY(checkout.shipment.shipper_date)
          : "",
      ),
      tracking_number: clean(checkout?.shipment?.tracking_number ?? ""),
      shipping_code: clean(checkout?.shipment?.ship_code ?? ""),
    };

    return rowItems.map((item) => {
      const product = item?.products;
      const purchasedProduct = item?.purchased_products;
      const itemValues = getCartItemExportValues(item, countryCode, taxId);
      const supplierName = item
        ? product?.owner?.business_name || "Prestige Home"
        : "";

      return {
        ...orderRow,
        product_id: clean(
          purchasedProduct?.id_provider ?? product?.id_provider ?? "",
        ),
        product_sku: clean(purchasedProduct?.sku ?? product?.sku ?? ""),
        product_ean: clean(purchasedProduct?.ean ?? product?.ean ?? ""),
        product_names: clean(purchasedProduct?.name ?? product?.name ?? ""),
        total_quantity: clean(itemValues.quantity),
        product_unit_price: clean(+itemValues.unitGross.toFixed(2)),
        product_line_total: clean(itemValues.lineGross),
        product_unit_net: clean(itemValues.unitNet),
        product_line_net: clean(itemValues.lineNet),
        product_tax_rate: clean(itemValues.taxRate),
        products_cost: clean(itemValues.productCost),
        freight_cost: clean(itemValues.freightCost),
        suppliers: clean(supplierName),
      };
    });
  });
}

export function exportOrderListTemplateToExcel(
  data: CheckOutMain[],
  fileName = "order_export.xlsx",
) {
  if (!Array.isArray(data) || data.length === 0) return;

  const rows = mapOrderListTemplateRows(data);
  if (rows.length === 0) return;

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
