export function parseTaxRate(tax: string | null | undefined): number {
  if (!tax) return 0;
  return Number(tax.replace("%", "")) / 100;
}
