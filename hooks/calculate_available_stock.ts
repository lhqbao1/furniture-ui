import { ProductItem } from "@/types/products";

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

export const calculateAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;

  const bundles = product.bundles ?? [];

  if (bundles.length > 0) {
    const bundleStocks = bundles
      .map((bundle) => {
        const qty = toNumber(bundle.quantity);
        if (qty <= 0) return Number.NaN;

        const bundleItem = bundle.bundle_item;
        if (!bundleItem) return 0;

        const hasChildStockData =
          bundleItem.stock != null || bundleItem.result_stock != null;
        if (!hasChildStockData) return Number.NaN;

        const childStock = calculateAvailableStock(bundleItem);
        const ratio = childStock / qty;
        return ratio >= 0 ? Math.floor(ratio) : Math.ceil(ratio);
      })
      .filter((value) => !Number.isNaN(value));

    if (bundleStocks.length > 0) {
      return Math.min(...bundleStocks);
    }
  }

  const stock = toNumber(product.stock);
  const resultStock = toNumber(product.result_stock);

  return stock - Math.abs(resultStock);
};
