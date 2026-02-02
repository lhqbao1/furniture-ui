import { ProductItem } from "@/types/products";

export type listItems = {
  id_provider: string;
  quantity: number;
  final_price: number;
  carrier: string;
  title?: string | undefined;
  sku?: string | undefined;
};

export const getCarrierFromItems = (items: listItems[]): string | undefined => {
  if (!items || items.length === 0) return undefined;

  // 1️⃣ Nếu có bất kỳ item nào là amm hoặc spedition → amm
  const hasAmm = items.some(
    (item) => item.carrier === "amm" || item.carrier === "spedition",
  );

  if (hasAmm) return "spedition";

  // 2️⃣ Nếu không có → lấy carrier của item gần nhất (từ cuối list)
  for (let i = items.length - 1; i >= 0; i--) {
    const carrier = items[i]?.carrier;
    if (carrier) return carrier;
  }

  return undefined;
};
