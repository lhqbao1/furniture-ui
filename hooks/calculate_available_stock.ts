import { ProductItem } from "@/types/products";

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

export const calculateAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;

  const bundles = product.bundles ?? [];

  if (bundles.length > 0) {
    const bundleStocks = bundles.map((bundle) => {
      const qty = toNumber(bundle.quantity);
      if (qty <= 0) return 0;

      const childStock = calculateAvailableStock(bundle.bundle_item);
      const ratio = childStock / qty;
      return ratio >= 0 ? Math.floor(ratio) : Math.ceil(ratio);
    });

    return Math.min(...bundleStocks);
  }

  const stock = toNumber(product.stock);
  const resultStock = toNumber(product.result_stock);

  return stock - Math.abs(resultStock);
};
