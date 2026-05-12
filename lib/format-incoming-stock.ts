import { format, getISOWeek } from "date-fns";

export const formatIncomingStockDate = (
  value?: Date | string | null,
): string => {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return `Week ${String(getISOWeek(date)).padStart(2, "0")} - ${format(
    date,
    "dd.MM",
  )}`;
};

export const formatIncomingStockEntry = (
  quantity: number | string | null | undefined,
  value?: Date | string | null,
): string => {
  return `${quantity ?? 0} | ${formatIncomingStockDate(value)}`;
};
