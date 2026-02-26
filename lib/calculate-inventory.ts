import { InventoryPosItem } from "@/types/products";

export const getTotalIncomingStock = (
  inventory?: InventoryPosItem[],
): number => {
  if (!inventory || inventory.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inventory.reduce((total, item) => {
    if ((item.quantity ?? 0) <= 0) return total;
    if (!item.list_delivery_date) return total;
    const date = new Date(item.list_delivery_date);
    if (Number.isNaN(date.getTime())) return total;
    date.setHours(0, 0, 0, 0);
    if (date < today) return total;
    return total + (item.quantity ?? 0);
  }, 0);
};
