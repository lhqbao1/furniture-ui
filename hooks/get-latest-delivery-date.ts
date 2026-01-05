import { calculateDeliveryEstimate } from "./get-estimated-shipping";

interface ProductForDeliveryEstimate {
  stock: number;
  inventory?: any[];
  deliveryTime?: string;
}

export function getOrderLatestDeliveryDate(
  products: ProductForDeliveryEstimate[],
): Date | null {
  const deliveryDates: Date[] = [];

  for (const product of products) {
    const estimate = calculateDeliveryEstimate(product);
    if (estimate?.to) {
      deliveryDates.push(estimate.to);
    }
  }

  if (!deliveryDates.length) return null;

  return new Date(Math.max(...deliveryDates.map((d) => d.getTime())));
}

export function formatDateToTrustedShops(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}
