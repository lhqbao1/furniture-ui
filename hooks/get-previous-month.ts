export function getMonthRange(date: Date) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    from_date: from.toISOString().slice(0, 10),
    to_date: to.toISOString().slice(0, 10),
  };
}

export function getPreviousMonthRange(date: Date) {
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthRange(prevMonth);
}
