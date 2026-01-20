import { CartItem } from "@/types/cart";
import { ManualOrderItem } from "./schema/manual-checkout";

type TaxBucket = {
  vatRate: number;
  gross: number;
  net: number;
  vat: number;
  discountGross?: number;
};

function parseTaxRate(
  tax?: string | null,
  country_code?: string | null,
  tax_id?: string | null,
): number {
  if (!tax) return 0;

  const value = Number(tax.replace("%", ""));
  if (Number.isNaN(value)) return 0;

  // 🇦🇹 Austria
  if (country_code === "AT") {
    // Có VAT ID → reverse charge → 0%
    if (tax_id) return 0;

    // Không VAT ID → map thuế
    if (value === 19) return 20 / 100;
    if (value === 7) return 10 / 100;

    return value / 100;
  }

  // 🇩🇪 Germany
  if (country_code === "DE") {
    // DE giữ nguyên dù có tax_id hay không
    return value / 100;
  }

  // Fallback cho country khác
  return value / 100;
}

function splitGross(gross: number, vatRate: number) {
  const net = +(gross / (1 + vatRate)).toFixed(2);
  const vat = +(gross - net).toFixed(2);
  return { net, vat };
}

export function calculateShippingCostManual(
  items: ManualOrderItem[],
  country_code?: string | null,
  tax_id?: string | null,
) {
  const hasAmm = items.some((item) => {
    const c = item?.carrier?.trim()?.toLowerCase();
    return !c || c === "amm" || c === "spedition";
  });

  const gross = hasAmm ? 35.95 : 5.95;

  // ✅ VAT cho shipping: base là 19%
  const vatRate = parseTaxRate("19%", country_code, tax_id);

  const { net, vat } = splitGross(gross, vatRate);

  return {
    gross: Number(gross) || 0,
    net: Number(net) || 0,
    vat: Number(vat) || 0,
    vatRate: Number(vatRate) || 0,
  };
}

export function calculateShippingCost(
  items: CartItem[],
  country_code?: string | null,
  tax_id?: string | null,
  total_shipping?: number,
) {
  const hasAmm = items.some(
    (item) =>
      item.products?.carrier.toLowerCase() === "amm" ||
      item.products?.carrier.toLowerCase() === "spedition",
  );

  const gross = total_shipping ?? (hasAmm ? 35.95 : 5.95);

  // ✅ VAT cho shipping: base là 19%
  const vatRate = parseTaxRate("19%", country_code, tax_id);

  const { net, vat } = splitGross(gross, vatRate);

  return {
    gross: Number(gross) || 0,
    net: Number(net) || 0,
    vat: Number(vat) || 0,
    vatRate: Number(vatRate) || 0,
  };
}

export function calculateOrderTaxWithDiscount(
  items: CartItem[],
  discountGross: number = 0, // GROSS discount
  country_code?: string | null,
  tax_id?: string | null,
  total_shipping?: number,
) {
  const buckets = new Map<number, TaxBucket>();

  // 1️⃣ Products (GROSS based)
  for (const item of items) {
    const vatRate = parseTaxRate(item.products?.tax, country_code, tax_id);
    const gross = Number(item.final_price); // ✅ TRUST GROSS

    if (!buckets.has(vatRate)) {
      buckets.set(vatRate, {
        vatRate,
        gross: 0,
        net: 0,
        vat: 0,
      });
    }

    buckets.get(vatRate)!.gross += gross;
  }

  const shipping = calculateShippingCost(
    items,
    country_code,
    tax_id,
    total_shipping,
  );

  const shippingGross = Number(shipping.gross) || 0;
  const shippingRate = Number(shipping.vatRate) || 0;

  if (!buckets.has(shippingRate)) {
    buckets.set(shippingRate, {
      vatRate: shippingRate,
      gross: 0,
      net: 0,
      vat: 0,
    });
  }

  buckets.get(shippingRate)!.gross += shippingGross;

  // 3️⃣ Total gross before discount
  let totalGrossBeforeDiscount = 0;
  for (const b of buckets.values()) {
    totalGrossBeforeDiscount += b.gross;
  }

  const appliedDiscountGross = Math.min(
    discountGross,
    totalGrossBeforeDiscount,
  );

  // 4️⃣ Phân bổ discount theo GROSS ratio
  let totalNet = 0;
  let totalVat = 0;

  for (const bucket of buckets.values()) {
    const ratio = bucket.gross / totalGrossBeforeDiscount;
    const discountGross = +(appliedDiscountGross * ratio).toFixed(2);

    bucket.discountGross = discountGross;
    bucket.gross = +(bucket.gross - discountGross).toFixed(2);

    let net = 0;
    let vat = 0;

    if (bucket.gross > 0) {
      const split = splitGross(bucket.gross, bucket.vatRate);
      net = split.net;
      vat = split.vat;
    }

    bucket.net = net;
    bucket.vat = vat;

    totalNet += net;
    totalVat += vat;
  }

  const totalGross = +(totalNet + totalVat).toFixed(2);

  return {
    buckets: Array.from(buckets.values()),
    shipping,
    discountGross: +appliedDiscountGross.toFixed(2),
    totalNet: +totalNet.toFixed(2),
    totalVat: +totalVat.toFixed(2),
    totalGross,
  };
}

export function calculateProductVAT(
  gross: number,
  tax?: string | null,
  country_code?: string | null,
  tax_id?: string | null,
) {
  const vatRate = parseTaxRate(tax, country_code, tax_id);

  const { net, vat } = splitGross(gross, vatRate);

  return {
    gross: +gross.toFixed(2),
    net,
    vat,
    vatRate,
  };
}
