import { BRAND_COUNTRY_OPTIONS, COUNTRY_ORIGIN_OPTIONS } from "@/data/data";

export function getCountryLabelDE(code?: string) {
  if (!code) return "-";

  return (
    COUNTRY_ORIGIN_OPTIONS.find((item) => item.value === code.toUpperCase())
      ?.label ?? code
  );
}

function normalize(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "");
}

export function getCountryCode(input: string) {
  if (!input) return null;

  const normalized = normalize(input);

  const match = BRAND_COUNTRY_OPTIONS.find(
    (c) => normalize(c.label) === normalized,
  );

  return match?.value ?? null;
}
