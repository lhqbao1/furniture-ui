import { BRAND_COUNTRY_OPTIONS, COUNTRY_ORIGIN_OPTIONS } from "@/data/data";

export function getCountryLabelDE(code?: string) {
  if (!code) return "-";

  return (
    COUNTRY_ORIGIN_OPTIONS.find((item) => item.value === code.toUpperCase())
      ?.label ?? code
  );
}

function normalize(str: string) {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

export function getCountryCode(input?: string | null) {
  if (!input) return null;

  const raw = String(input).trim();
  if (!raw) return null;

  // If UI/form already stores ISO country code (e.g. "AT", "DE"), use it directly.
  const byValue = BRAND_COUNTRY_OPTIONS.find(
    (c) => c.value.toUpperCase() === raw.toUpperCase(),
  );
  if (byValue) return byValue.value;

  const normalized = normalize(raw);

  const match = BRAND_COUNTRY_OPTIONS.find(
    (c) => normalize(c.label) === normalized,
  );

  if (match?.value) return match.value;

  // Common aliases fallback
  if (normalized === "austria" || normalized === "osterreich") return "AT";
  if (normalized === "germany" || normalized === "deutschland") return "DE";

  return null;
}
