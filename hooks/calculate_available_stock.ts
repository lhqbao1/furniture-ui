import { ProductItem } from "@/types/products";

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const calculateOwnAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;
  const stock = toNumber(product.stock);
  const resultStock = toNumber(product.result_stock);
  return stock - Math.abs(resultStock);
};

export const calculateAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;

  return calculateOwnAvailableStock(product);
};
