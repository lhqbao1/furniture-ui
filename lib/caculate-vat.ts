export function calculateVAT({
  items = 0,
  shipping = 0,
  discount = 0,
  taxPercent = 19,
}: {
  items?: number;
  shipping?: number;
  discount?: number;
  taxPercent?: number;
}) {
  const total = (items ?? 0) + (shipping ?? 0) + (discount ?? 0);
  const taxRate = (taxPercent ?? 19) / 100;
  const divisor = 1 + taxRate;

  return (total / divisor) * taxRate;
}
