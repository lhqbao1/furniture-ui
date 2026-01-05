export function getTrend(current: number, previous: number) {
  if (!previous || previous <= 0) {
    return {
      direction: "neutral" as const,
      percent: 0,
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
