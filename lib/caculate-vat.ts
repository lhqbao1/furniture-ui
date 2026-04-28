import { CartItem } from "@/types/cart";
import { ManualOrderItem } from "./schema/manual-checkout";

type TaxBucket = {
  vatRate: number;
  gross: number;
  net: number;
  vat: number;
  discountGross?: number;
};

function normalizeVatRate(vatRate: number) {
  if (!Number.isFinite(vatRate)) return 0;
  return vatRate > 1 ? vatRate / 100 : vatRate;
}

function getCartItemTax(item: CartItem) {
  return item.purchased_products?.tax ?? item.products?.tax;
}

function getCartItemUnitGross(item: CartItem) {
  return (
    Number(
      item.purchased_products?.final_price ??
        item.products?.final_price ??
        item.final_price ??
        item.item_price,
    ) || 0
  );
}

export function calculateCartItemDisplayPricing(
  item: CartItem,
  country_code?: string | null,
  tax_id?: string | null,
) {
  const tax = getCartItemTax(item);
  const unitGross = getCartItemUnitGross(item);
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const { net: unitNet, vatRate } = calculateProductVAT(
    unitGross,
    tax,
    country_code,
    tax_id,
  );
  const normalizedVatRate = normalizeVatRate(Number(vatRate) || 0);
  const lineNet = +(unitNet * quantity).toFixed(2);
  const lineVat = +(lineNet * normalizedVatRate).toFixed(2);
  const lineGross = +(lineNet + lineVat).toFixed(2);

  return {
    tax,
    quantity,
    unitGross: +unitGross.toFixed(2),
    unitNet: +unitNet.toFixed(2),
    vatRate: normalizedVatRate,
    lineNet,
    lineVat,
    lineGross,
  };
}

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

function splitNet(net: number, vatRate: number) {
  const gross = +(net * (1 + vatRate)).toFixed(2);
  const vat = +(gross - net).toFixed(2);
  return { gross, vat };
}

type NetShippingInputItem = {
  unitNet: number;
  quantity: number;
  tax?: string | null;
};

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
  // ❗ Không có carrier -> return 0
  if (!items || items.every((i) => !i.products?.carrier)) {
    return {
      gross: 0,
      net: 0,
      vat: 0,
      vatRate: 0,
    };
  }

  const hasAmm = items.some(
    (item) =>
      item.products?.carrier?.toLowerCase() === "amm" ||
      item.products?.carrier?.toLowerCase() === "spedition",
  );

  const gross = total_shipping ?? (hasAmm ? 35.95 : 5.95);

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

    const unitGross =
      Number(
        item.purchased_products
          ? item.purchased_products?.final_price
          : item.products?.final_price,
      ) || 0;

    const quantity = Number(item.quantity) || 1;

    const gross = +(unitGross * quantity).toFixed(2);

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

  const shippingBase = calculateShippingCost(
    items,
    country_code,
    tax_id,
    total_shipping,
  );
  const shippingGross = Math.max(0, Number(shippingBase.gross) || 0);

  // ✅ Shipping VAT follows main goods VAT composition:
  // split shipping gross proportionally by product gross per VAT bucket.
  const productBuckets = Array.from(buckets.entries())
    .map(([vatRate, bucket]) => ({
      vatRate,
      gross: +(Number(bucket.gross) || 0).toFixed(2),
    }))
    .filter((bucket) => bucket.gross > 0);

  let shippingNet = 0;
  let shippingVat = 0;
  const shippingRates = new Set<number>();

  const applyShippingToBucket = (vatRate: number, gross: number) => {
    const grossRounded = +gross.toFixed(2);
    if (grossRounded <= 0) return;

    if (!buckets.has(vatRate)) {
      buckets.set(vatRate, {
        vatRate,
        gross: 0,
        net: 0,
        vat: 0,
      });
    }

    const bucket = buckets.get(vatRate)!;
    bucket.gross = +(bucket.gross + grossRounded).toFixed(2);

    const split = splitGross(grossRounded, vatRate);
    shippingNet = +(shippingNet + split.net).toFixed(2);
    shippingVat = +(shippingVat + split.vat).toFixed(2);
    shippingRates.add(vatRate);
  };

  if (shippingGross > 0) {
    const totalProductGross = +productBuckets
      .reduce((sum, bucket) => sum + bucket.gross, 0)
      .toFixed(2);

    if (productBuckets.length === 0 || totalProductGross <= 0) {
      applyShippingToBucket(Number(shippingBase.vatRate) || 0, shippingGross);
    } else {
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

        applyShippingToBucket(bucket.vatRate, allocatedGross);
      });

      if (remainingGross > 0) {
        const fallbackRate = productBuckets[productBuckets.length - 1].vatRate;
        applyShippingToBucket(fallbackRate, remainingGross);
      }
    }
  }

  const shipping = {
    gross: +shippingGross.toFixed(2),
    net: +shippingNet.toFixed(2),
    vat: +shippingVat.toFixed(2),
    vatRate:
      shippingRates.size === 1
        ? Number(Array.from(shippingRates)[0]) || 0
        : 0,
  };

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
    const ratio =
      totalGrossBeforeDiscount > 0 ? bucket.gross / totalGrossBeforeDiscount : 0;
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

  // Discount has already been allocated into each bucket above,
  // so it must not be subtracted again here.
  const totalNetWithoutShipping = totalNet - shipping.net;

  return {
    buckets: Array.from(buckets.values()),
    shipping,
    discountGross: +appliedDiscountGross.toFixed(2),
    totalNet: +totalNet.toFixed(2),
    totalVat: +totalVat.toFixed(2),
    totalGross,
    totalNetWithoutShipping: +totalNetWithoutShipping.toFixed(2),
  };
}

export function calculateDisplayOrderTaxSummary(
  items: CartItem[],
  discountGross: number = 0,
  country_code?: string | null,
  tax_id?: string | null,
  total_shipping?: number,
) {
  const buckets = new Map<number, TaxBucket>();

  for (const item of items) {
    const pricing = calculateCartItemDisplayPricing(item, country_code, tax_id);

    if (!buckets.has(pricing.vatRate)) {
      buckets.set(pricing.vatRate, {
        vatRate: pricing.vatRate,
        gross: 0,
        net: 0,
        vat: 0,
      });
    }

    const bucket = buckets.get(pricing.vatRate)!;
    bucket.net = +(bucket.net + pricing.lineNet).toFixed(2);
    bucket.vat = +(bucket.vat + pricing.lineVat).toFixed(2);
    bucket.gross = +(bucket.gross + pricing.lineGross).toFixed(2);
  }

  const shippingBase = calculateShippingCost(
    items,
    country_code,
    tax_id,
    total_shipping,
  );
  const shippingRate = normalizeVatRate(Number(shippingBase.vatRate) || 0);
  const shippingNet = +(Number(shippingBase.net) || 0).toFixed(2);
  const shippingVat = +(shippingNet * shippingRate).toFixed(2);
  const shippingGross = +(shippingNet + shippingVat).toFixed(2);

  if (shippingGross > 0) {
    if (!buckets.has(shippingRate)) {
      buckets.set(shippingRate, {
        vatRate: shippingRate,
        gross: 0,
        net: 0,
        vat: 0,
      });
    }

    const shippingBucket = buckets.get(shippingRate)!;
    shippingBucket.net = +(shippingBucket.net + shippingNet).toFixed(2);
    shippingBucket.vat = +(shippingBucket.vat + shippingVat).toFixed(2);
    shippingBucket.gross = +(shippingBucket.gross + shippingGross).toFixed(2);
  }

  const totalNet = +Array.from(buckets.values())
    .reduce((sum, bucket) => sum + (Number(bucket.net) || 0), 0)
    .toFixed(2);
  const totalVat = +Array.from(buckets.values())
    .reduce((sum, bucket) => sum + (Number(bucket.vat) || 0), 0)
    .toFixed(2);
  const totalGrossBeforeDiscount = +(totalNet + totalVat).toFixed(2);
  const appliedDiscountGross = +Math.min(
    Math.max(0, Number(discountGross) || 0),
    totalGrossBeforeDiscount,
  ).toFixed(2);
  const totalGross = +(totalGrossBeforeDiscount - appliedDiscountGross).toFixed(
    2,
  );
  const totalNetWithoutShipping = +(totalNet - shippingNet).toFixed(2);

  return {
    buckets: Array.from(buckets.values()),
    shipping: {
      gross: shippingGross,
      net: shippingNet,
      vat: shippingVat,
      vatRate: shippingRate,
    },
    discountGross: appliedDiscountGross,
    totalNet,
    totalVat,
    totalGross,
    totalNetWithoutShipping,
  };
}

export function calculateProductVATFromNet(
  net: number,
  tax?: string | null,
  country_code?: string | null,
  tax_id?: string | null,
) {
  const vatRate = parseTaxRate(tax, country_code, tax_id);
  const normalizedNet = Number(net) || 0;
  const { gross, vat } = splitNet(normalizedNet, vatRate);

  return {
    gross,
    net: +normalizedNet.toFixed(2),
    vat,
    vatRate,
  };
}

export function calculateShippingGrossFromNet(
  items: NetShippingInputItem[],
  shippingNet: number,
  country_code?: string | null,
  tax_id?: string | null,
) {
  const normalizedShippingNet = Math.max(0, Number(shippingNet) || 0);

  if (normalizedShippingNet <= 0) {
    return {
      gross: 0,
      net: 0,
      vat: 0,
      vatRate: 0,
    };
  }

  const buckets = new Map<number, number>();

  for (const item of items) {
    const vatRate = parseTaxRate(item.tax, country_code, tax_id);
    const rowNet =
      (Math.max(0, Number(item.unitNet) || 0) *
        Math.max(0, Number(item.quantity) || 0)) ||
      0;

    if (rowNet <= 0) continue;
    buckets.set(vatRate, +(Number(buckets.get(vatRate)) + rowNet).toFixed(2));
  }

  const productBuckets = Array.from(buckets.entries())
    .map(([vatRate, net]) => ({ vatRate, net: +(Number(net) || 0).toFixed(2) }))
    .filter((bucket) => bucket.net > 0);

  let grossTotal = 0;
  let vatTotal = 0;
  const shippingRates = new Set<number>();

  const applyShippingNetToBucket = (vatRate: number, allocatedNet: number) => {
    const netRounded = +allocatedNet.toFixed(2);
    if (netRounded <= 0) return;

    const split = splitNet(netRounded, vatRate);
    grossTotal = +(grossTotal + split.gross).toFixed(2);
    vatTotal = +(vatTotal + split.vat).toFixed(2);
    shippingRates.add(vatRate);
  };

  if (productBuckets.length === 0) {
    const fallbackRate = parseTaxRate("19%", country_code, tax_id);
    applyShippingNetToBucket(fallbackRate, normalizedShippingNet);
  } else {
    const totalProductNet = +productBuckets
      .reduce((sum, bucket) => sum + bucket.net, 0)
      .toFixed(2);
    let remainingNet = +normalizedShippingNet.toFixed(2);

    productBuckets.forEach((bucket, index) => {
      const isLast = index === productBuckets.length - 1;
      let allocatedNet = isLast
        ? remainingNet
        : +((normalizedShippingNet * bucket.net) / totalProductNet).toFixed(2);

      allocatedNet = Math.max(
        0,
        Math.min(+remainingNet.toFixed(2), allocatedNet),
      );
      remainingNet = +(remainingNet - allocatedNet).toFixed(2);

      applyShippingNetToBucket(bucket.vatRate, allocatedNet);
    });

    if (remainingNet > 0) {
      const fallbackRate = productBuckets[productBuckets.length - 1].vatRate;
      applyShippingNetToBucket(fallbackRate, remainingNet);
    }
  }

  return {
    gross: +grossTotal.toFixed(2),
    net: +normalizedShippingNet.toFixed(2),
    vat: +vatTotal.toFixed(2),
    vatRate:
      shippingRates.size === 1
        ? Number(Array.from(shippingRates)[0]) || 0
        : 0,
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
    gross: gross.toFixed(2) ?? 0,
    net,
    vat,
    vatRate,
  };
}
