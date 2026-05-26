import { CheckOutMain } from "@/types/checkout";

export type B2BInvoicePartyInfo = {
  company_name: string;
  tax_id: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
};

const normalizeMarketplaceKey = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeText = (value: unknown) => String(value ?? "").trim();
const normalizeCountryCode = (value: unknown) =>
  normalizeText(value).toUpperCase();

export const B2B_INVOICE_PRESET_BY_MARKETPLACE: Record<
  string,
  B2BInvoicePartyInfo | null
> = {
  netto: {
    company_name: "NeS GmbH",
    tax_id: "DE811205180",
    invoice_address: "Industriepark Ponholz 1",
    invoice_city: "Maxhütte-Haidhof",
    invoice_postal_code: "93142",
    invoice_country: "DE",
  },
  freakout: {
    company_name: "FREAK-OUT GmbH",
    tax_id: "ATU80855139",
    invoice_address: "Steingasse 6a",
    invoice_city: "Linz",
    invoice_postal_code: "4020",
    invoice_country: "AT",
  },
  inprodius: {
    company_name: "Inprodius Solutions GmbH",
    tax_id: "DE815533652",
    invoice_address: "Lange Wende 41-43",
    invoice_city: "Soest",
    invoice_postal_code: "59494",
    invoice_country: "DE",
  },
  norma: {
    company_name: "NORMA24 Online-Shop GmbH & Co.KG",
    tax_id: "DE281146018",
    invoice_address: "Manfred-Roth-Straße 7",
    invoice_city: "Fürth",
    invoice_postal_code: "90766",
    invoice_country: "DE",
  },
  forstinger: {
    company_name: "Forstinger eCom GmbH",
    tax_id: "ATU81672717",
    invoice_address: "Königstetter Straße 128-134",
    invoice_city: "Tulln",
    invoice_postal_code: "3430",
    invoice_country: "AT",
  },
  "euro-tops": {
    company_name: "Eurotops Versand GmbH",
    tax_id: "DE121393328",
    invoice_address: "Elisabeth-Selbert-Str. 3",
    invoice_city: "Langenfeld",
    invoice_postal_code: "40764",
    invoice_country: "DE",
  },
  bauhaus: {
    company_name: "BAHAG Baus Handelsgesellschaft AG",
    tax_id: "DE143872368",
    invoice_address: "Gutenbergstr. 21",
    invoice_city: "Mannheim",
    invoice_postal_code: "68167",
    invoice_country: "DE",
  },
  bader: {
    company_name: "BRUNO BADER GmbH + Co. KG",
    tax_id: "DE 144173081",
    invoice_address: "Maximilianstr. 48",
    invoice_city: "Pforzheim",
    invoice_postal_code: "75172",
    invoice_country: "DE",
  },
  xxxlutz: {
    company_name: "XXXLutz KG",
    tax_id: "ATU65296645",
    invoice_address: "Römerstrasse 39",
    invoice_city: "Wels",
    invoice_postal_code: "4600",
    invoice_country: "AT",
  },
  moebelix: {
    company_name: "XXXLutz KG",
    tax_id: "ATU65296645",
    invoice_address: "Römerstrasse 39",
    invoice_city: "Wels",
    invoice_postal_code: "4600",
    invoice_country: "AT",
  },
  möbelix: {
    company_name: "Möbelix GmbH",
    tax_id: "ATU63842248",
    invoice_address: "Römerstraße 39",
    invoice_city: "Wels",
    invoice_postal_code: "4600",
    invoice_country: "AT",
  },
  otto: {
    company_name: "Otto GmbH & Co. KGaA",
    tax_id: "DE340596305",
    invoice_address: "Werner-Otto-Straße 1-7",
    invoice_city: "Hamburg",
    invoice_postal_code: "22179",
    invoice_country: "DE",
  },
  docmorris: {
    company_name: "DocMorris N.V.",
    tax_id: "NL819861303B01",
    invoice_address: "Avantisallee 152",
    invoice_city: "Heerlen",
    invoice_postal_code: "6422 RA",
    invoice_country: "NL",
  },
  praktiker: null,
  check24: null,
  amazon: null,
  prestige: null,
  channel21: null,
  hornbach: null,
  neckermann: null,
};

export const resolveB2BInvoicePartyInfo = ({
  marketplace,
  order,
}: {
  marketplace?: string | null;
  order?: CheckOutMain | null;
}): B2BInvoicePartyInfo => {
  const preset =
    B2B_INVOICE_PRESET_BY_MARKETPLACE[
      normalizeMarketplaceKey(marketplace ?? order?.from_marketplace)
    ] ?? null;
  const firstCheckout = order?.checkouts?.[0];
  const invoiceAddress = firstCheckout?.invoice_address;
  const user = firstCheckout?.user;

  return {
    company_name: normalizeText(
      preset?.company_name ?? invoiceAddress?.recipient_name,
    ),
    tax_id: normalizeText(preset?.tax_id ?? user?.tax_id),
    invoice_address: normalizeText(
      preset?.invoice_address ?? invoiceAddress?.address_line,
    ),
    invoice_city: normalizeText(preset?.invoice_city ?? invoiceAddress?.city),
    invoice_postal_code: normalizeText(
      preset?.invoice_postal_code ?? invoiceAddress?.postal_code,
    ),
    invoice_country: normalizeCountryCode(
      preset?.invoice_country ?? invoiceAddress?.country ?? "DE",
    ),
  };
};

export const normalizeB2BInvoicePartyInfo = (
  value: B2BInvoicePartyInfo,
): B2BInvoicePartyInfo => ({
  company_name: normalizeText(value.company_name),
  tax_id: normalizeText(value.tax_id),
  invoice_address: normalizeText(value.invoice_address),
  invoice_city: normalizeText(value.invoice_city),
  invoice_postal_code: normalizeText(value.invoice_postal_code),
  invoice_country: normalizeCountryCode(value.invoice_country) || "DE",
});
