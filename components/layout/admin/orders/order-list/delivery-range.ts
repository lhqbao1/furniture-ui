const parseDateValue = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  const fallback = `${value}Z`;
  const fallbackDate = new Date(fallback);
  if (!Number.isNaN(fallbackDate.getTime())) return fallbackDate;

  return null;
};

export const formatDeliveryRangeLabel = (
  fromValue?: string | Date | null,
  toValue?: string | Date | null,
): string => {
  const fromDate = parseDateValue(fromValue);
  const toDate = parseDateValue(toValue);

  if (!fromDate && !toDate) return "-";

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    });

  if (fromDate && toDate) {
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  }

  return formatDate(fromDate ?? toDate!);
};
