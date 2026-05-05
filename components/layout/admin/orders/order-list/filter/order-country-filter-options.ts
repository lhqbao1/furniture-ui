import { EN_COUNTRY_OPTIONS } from "@/data/data";

type CountryOption = {
  key: string;
  label: string;
  flag: string;
};

const EUROPEAN_COUNTRY_CODES = [
  "AL",
  "AD",
  "AM",
  "AT",
  "AZ",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GE",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SK",
  "SM",
  "TR",
  "UA",
  "VA",
  "XK",
] as const;

const COUNTRY_LABEL_MAP = new Map(
  EN_COUNTRY_OPTIONS.map((country) => [country.value.toUpperCase(), country.label]),
);

const COUNTRY_LABEL_OVERRIDES: Record<string, string> = {
  XK: "Kosovo",
};

export function countryCodeToFlagEmoji(code: string) {
  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return "🏳️";
  }

  return String.fromCodePoint(
    ...normalized.split("").map((char) => 127397 + char.charCodeAt(0)),
  );
}

export function normalizeOrderCountryCode(value?: string | null) {
  const normalized = value?.trim().toUpperCase();

  if (!normalized) return "";
  if (normalized === "UK") return "GB";

  return normalized;
}

export const ORDER_EUROPEAN_COUNTRY_OPTIONS: CountryOption[] =
  EUROPEAN_COUNTRY_CODES.map((code) => ({
    key: code,
    label: COUNTRY_LABEL_OVERRIDES[code] ?? COUNTRY_LABEL_MAP.get(code) ?? code,
    flag: countryCodeToFlagEmoji(code),
  })).sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
