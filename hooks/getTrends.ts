export type TrendDirection = "up" | "down" | "neutral" | "no-data";

export function getTrend(current: number, previous?: number | null) {
  // ❗ CASE 1: tháng trước không có data
  if (previous == null || previous === 0) {
    return {
      direction: "no-data" as const,
      percent: 0,
    };
  }

  // ❗ CASE 2: có data nhưng = 0
  if (previous === 0) {
    if (current === 0) {
      return {
        direction: "neutral" as const,
        percent: 0,
      };
    }

    // có data = 0 → tăng từ 0
    return {
      direction: "up" as const,
      percent: 100,
    };
  }

  const percent = ((current - previous) / previous) * 100;

  if (percent > 0) {
    return {
      direction: "up" as const,
      percent,
    };
  }

  if (percent < 0) {
    return {
      direction: "down" as const,
      percent: Math.abs(percent),
    };
  }

  return {
    direction: "neutral" as const,
    percent: 0,
  };
}
