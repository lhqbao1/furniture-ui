import { COUNTRY_ORIGIN_OPTIONS } from "@/data/data";

export function getCountryLabelDE(code?: string) {
  if (!code) return "-";

  return (
    COUNTRY_ORIGIN_OPTIONS.find((item) => item.value === code.toUpperCase())
      ?.label ?? code
  );
}
