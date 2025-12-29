import { CartItem } from "@/types/cart";

type TaxBucket = {
  vatRate: number;
  gross: number;
  net: number;
  vat: number;
  discountGross?: number;
};

function parseTaxRate(tax?: string | null): number {
  if (!tax) return 0;
  return Number(tax.replace("%", "")) / 100;
}

function splitGross(gross: number, vatRate: number) {
  const net = +(gross / (1 + vatRate)).toFixed(2);
  const vat = +(gross - net).toFixed(2);
  return { net, vat };
}

function calculateShippingCost(items: CartItem[]) {
  const hasAmm = items.some((item) => item.products?.carrier === "amm");
  const gross = hasAmm ? 35.95 : 5.95;
  const vatRate = 0.19;

  const { net, vat } = splitGross(gross, vatRate);

  return { gross, net, vat, vatRate };
}

export function calculateOrderTaxWithDiscount(
  items: CartItem[],
  discountGross: number = 0, // GROSS discount
) {
  const buckets = new Map<number, TaxBucket>();

  // 1️⃣ Products (GROSS based)
  for (const item of items) {
    const vatRate = parseTaxRate(item.products?.tax);
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

  // 2️⃣ Shipping (always 19%)
  const shipping = calculateShippingCost(items);
  if (!buckets.has(shipping.vatRate)) {
    buckets.set(shipping.vatRate, {
      vatRate: shipping.vatRate,
      gross: 0,
      net: 0,
      vat: 0,
    });
  }
  buckets.get(shipping.vatRate)!.gross += shipping.gross;

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
    const bucketDiscountGross = +(appliedDiscountGross * ratio).toFixed(2);

    bucket.discountGross = bucketDiscountGross;
    bucket.gross = +(bucket.gross - bucketDiscountGross).toFixed(2);

    const { net, vat } = splitGross(bucket.gross, bucket.vatRate);

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
