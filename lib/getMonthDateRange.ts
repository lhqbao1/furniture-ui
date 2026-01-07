export const getMonthDateRange = (
  year: number,
  month: number,
): { from_date: string; to_date: string } => {
  const from = new Date(year, month - 1, 1, 0, 0, 0);
  const to = new Date(year, month, 0, 0, 0, 0);

  const toLocalISOString = (date: Date) => date.toISOString().replace("Z", "");

  return {
    from_date: toLocalISOString(from),
    to_date: toLocalISOString(to),
  };
};
