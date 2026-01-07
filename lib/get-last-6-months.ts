function formatDateLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getLast6Months() {
  const now = new Date();

  return Array.from({ length: 6 }).map((_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);

    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      label: date.toLocaleString("en-US", { month: "long" }),
      from_date: formatDateLocal(from), // ✅ FIX
      to_date: formatDateLocal(to), // ✅ FIX
    };
  });
}
