import { ProductItem } from "@/types/products";

type IncomingSourceItem = {
  quantity?: unknown;
  list_delivery_date?: unknown;
};

type NormalizedIncomingItem = {
  quantity: number;
  date: Date;
};

type CalculateIncomingStockOptions = {
  inventoryPo?: IncomingSourceItem[] | IncomingSourceItem | null;
  referenceDate?: Date;
};

export type IncomingStockSummary = {
  incomingStock: number;
  nearestIncomingDate: Date | null;
  latestIncomingDate: Date | null;
};

const EMPTY_SUMMARY: IncomingStockSummary = {
  incomingStock: 0,
  nearestIncomingDate: null,
  latestIncomingDate: null,
};

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const toArray = <T>(value: T[] | T | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

const normalizeFutureIncomingItems = (
  source: IncomingSourceItem[] | IncomingSourceItem | null | undefined,
  referenceDate: Date,
): NormalizedIncomingItem[] => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  return toArray(source).flatMap((item) => {
    const quantity = toNumber(item?.quantity);
    if (quantity <= 0) return [];

    const rawDate = item?.list_delivery_date;
    if (!rawDate) return [];

    const date = new Date(String(rawDate));
    if (Number.isNaN(date.getTime())) return [];

    date.setHours(0, 0, 0, 0);
    // Keep consistent with product-list "incoming stock" column:
    // only future deliveries (strictly after today).
    if (date <= today) return [];

    return [{ quantity, date }];
  });
};

const summarizeIncomingItems = (
  items: NormalizedIncomingItem[],
): IncomingStockSummary => {
  if (items.length === 0) return EMPTY_SUMMARY;

  const incomingStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const timestamps = items.map((item) => item.date.getTime());

  return {
    incomingStock,
    nearestIncomingDate: new Date(Math.min(...timestamps)),
    latestIncomingDate: new Date(Math.max(...timestamps)),
  };
};

export const calculateIncomingStockSummary = (
  product?: Partial<ProductItem> | null,
  options: CalculateIncomingStockOptions = {},
): IncomingStockSummary => {
  if (!product) return EMPTY_SUMMARY;

  const referenceDate = options.referenceDate ?? new Date();
  const bundles = product.bundles ?? [];

  if (bundles.length > 0) {
    const bundleIncomingStocks: number[] = [];
    const bundleIncomingDates: Date[] = [];

    for (const bundle of bundles) {
      const quantityPerBundle = toNumber(bundle?.quantity);
      if (quantityPerBundle <= 0) continue;

      const bundleIncomingItems = normalizeFutureIncomingItems(
        bundle?.bundle_item?.inventory_pos,
        referenceDate,
      );

      const bundleIncomingQuantity = bundleIncomingItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      bundleIncomingStocks.push(
        Math.floor(bundleIncomingQuantity / quantityPerBundle),
      );

      if (bundleIncomingItems.length > 0) {
        const latestDate = new Date(
          Math.max(...bundleIncomingItems.map((item) => item.date.getTime())),
        );
        bundleIncomingDates.push(latestDate);
      }
    }

    if (bundleIncomingStocks.length > 0) {
      const latestIncomingDate =
        bundleIncomingDates.length > 0
          ? new Date(
              Math.max(...bundleIncomingDates.map((date) => date.getTime())),
            )
          : null;

      return {
        incomingStock: Math.max(0, Math.min(...bundleIncomingStocks)),
        // Bundle parent depends on the slowest child incoming date.
        nearestIncomingDate: latestIncomingDate,
        latestIncomingDate,
      };
    }
  }

  const source = options.inventoryPo ?? product.inventory_pos ?? [];
  const normalizedItems = normalizeFutureIncomingItems(source, referenceDate);
  return summarizeIncomingItems(normalizedItems);
};
