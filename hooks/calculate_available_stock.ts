import { ProductItem } from "@/types/products";

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const calculateOwnAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;
  const stock = toNumber(product.stock);
  const resultStock = toNumber(product.result_stock);
  return Math.max(0, stock - Math.abs(resultStock));
};

const calculateBundleAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;

  const bundles = product.bundles ?? [];

  if (bundles.length === 0) {
    return calculateOwnAvailableStock(product);
  }

  const bundleStocks = bundles
    .map((bundle) => {
      const qty = toNumber(bundle.quantity);
      if (qty <= 0) return Number.NaN;

      const bundleItem = bundle.bundle_item;
      if (!bundleItem) return 0;

      // Bundle parent must follow the available stock of each child item.
      const childAvailable = calculateAvailableStock(bundleItem);
      return Math.floor(childAvailable / qty);
    })
    .filter((value) => !Number.isNaN(value));

  if (bundleStocks.length > 0) {
    return Math.max(0, Math.min(...bundleStocks));
  }

  return calculateOwnAvailableStock(product);
};

export const calculateAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;

  const stock = calculateBundleAvailableStock(product);
  const resultStock = toNumber(product.result_stock);

  return Math.max(0, stock - Math.abs(resultStock));
};
