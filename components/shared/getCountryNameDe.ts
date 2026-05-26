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
    .replace(/[^a-z0-9]/g, "")
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

const COUNTRY_ORIGIN_ALIASES: Record<string, string> = {
  at: "AT",
  austria: "AT",
  osterreich: "AT",
  oesterreich: "AT",
  de: "DE",
  germany: "DE",
  deutschland: "DE",
  cn: "CN",
  china: "CN",
  vn: "VN",
  vietnam: "VN",
  vietnamese: "VN",
};

export function getCountryOriginCode(
  input?: string | null,
): string | undefined {
  if (!input) return undefined;

  const raw = String(input).trim();
  if (!raw) return undefined;

  const byValue = COUNTRY_ORIGIN_OPTIONS.find(
    (item) => item.value.toUpperCase() === raw.toUpperCase(),
  );
  if (byValue) return byValue.value;

  const normalized = normalize(raw);

  const byLabel = COUNTRY_ORIGIN_OPTIONS.find(
    (item) => normalize(item.label) === normalized,
  );
  if (byLabel?.value) return byLabel.value;

  return COUNTRY_ORIGIN_ALIASES[normalized];
}
