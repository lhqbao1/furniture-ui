import { formatDateToNum } from "@/lib/ios-to-num";
import { CheckOutMain } from "@/types/checkout";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { B2BInvoiceFooter } from "./b2b-invoice-footer";
import { calculateProductVAT } from "@/lib/caculate-vat";

Font.register({
  family: "Figtree",
  src: "/fonts/Figtree/Figtree-VariableFont_wght.ttf",
});

interface B2BInvoicePDFFileProps {
  invoiceId: string;
  servicePeriod?: string;
  orderNumber?: string;
  introText: string;
  paymentNote: string;
  orders: CheckOutMain[];
}

type MarketplacePreset = {
  company_name: string;
  tax_id: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
};

const PRESET_BY_MARKETPLACE: Record<string, MarketplacePreset | null> = {
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
  XXXLUTZ: {
    company_name: "XXXLutz KG",
    tax_id: "ATU65296645",
    invoice_address: "Römerstrasse 39",
    invoice_city: "Wels",
    invoice_postal_code: "4600",
    invoice_country: "AT",
  },
  praktiker: null,
  check24: null,
  amazon: null,
  prestige: null,
};
const PDF_GRAY_BG = "#D2D2D2";
const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 132,
    fontSize: 11,
    fontFamily: "Figtree",
    color: "#1f1f1f",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 20,
  },
});

const truncateText = (value: string, maxLength = 28) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
};

const formatEur = (value: number) =>
  `${value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

const formatTaxPercent = (tax: unknown) => {
  if (tax === null || tax === undefined) return "-";

  const formatValue = (value: number) =>
    `${value.toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}%`;

  if (typeof tax === "number") {
    if (!Number.isFinite(tax)) return "-";
    const percentageValue = tax > 1 ? tax : tax * 100;
    return formatValue(percentageValue);
  }

  if (typeof tax === "string") {
    const normalized = tax.trim();
    if (!normalized) return "-";

    const cleaned = normalized
      .replace("%", "")
      .replace(",", ".")
      .trim();
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return "-";

    const percentageValue = parsed > 1 ? parsed : parsed * 100;
    return formatValue(percentageValue);
  }

  return "-";
};

export const B2BInvoicePDFFile = ({
  invoiceId,
  servicePeriod,
  orderNumber,
  introText,
  paymentNote,
  orders,
}: B2BInvoicePDFFileProps) => {
  const selectedMarketplace =
    orders?.[0]?.from_marketplace?.toLowerCase() ?? "";
  const marketplacePreset = PRESET_BY_MARKETPLACE[selectedMarketplace] ?? null;
  const invoiceCountry =
    (
      marketplacePreset?.invoice_country ??
      orders?.[0]?.checkouts?.[0]?.invoice_address?.country ??
      ""
    )
      .toString()
      .toUpperCase()
      .trim() || "DE";
  const isGermanyInvoice = invoiceCountry === "DE";
  const isEuInvoice = EU_COUNTRIES.has(invoiceCountry);
  const cleanedOrderNumber = orderNumber?.trim() ?? "";
  const invoiceTaxId =
    marketplacePreset?.tax_id ?? orders?.[0]?.checkouts?.[0]?.user?.tax_id;
  const titleLine = cleanedOrderNumber
    ? `Rechnung Nr. ${invoiceId} - Ihre Bestellung ${cleanedOrderNumber}`
    : `Rechnung Nr. ${invoiceId}`;
  const defaultIntroText = `${titleLine}

Sehr geehrte Damen und Herren,
vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!
Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:`;
  const resolvedIntroText = introText?.trim() ? introText : defaultIntroText;
  const introLines = resolvedIntroText.replace(/\r\n/g, "\n").split("\n");

  const defaultPaymentText = `Zahlungsbedingungen:

Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene Konto.`;
  const resolvedPaymentNote = paymentNote?.trim()
    ? paymentNote
    : defaultPaymentText;
  const paymentLines = resolvedPaymentNote.replace(/\r\n/g, "\n").split("\n");
  const displayRows = orders.map((order, index) => {
    const orderItems = (order.checkouts ?? []).flatMap((checkout) => {
      if (Array.isArray(checkout.cart)) {
        return checkout.cart.flatMap((cartItem) => cartItem.items ?? []);
      }
      return checkout.cart?.items ?? [];
    });
    const firstItem = orderItems[0];
    const quantity =
      orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) ||
      1;
    const unitGross =
      Number(
        firstItem?.item_price ??
          firstItem?.purchased_products?.final_price ??
          firstItem?.products?.final_price ??
          firstItem?.final_price ??
          0,
      ) || 0;
    const rowGross = unitGross * quantity;
    const shippingGross = Number(order.total_shipping) || 0;
    const taxValue =
      firstItem?.purchased_products?.tax ?? firstItem?.products?.tax ?? null;
    const unitVatCalculation = calculateProductVAT(
      unitGross,
      taxValue,
      invoiceCountry,
      invoiceTaxId,
    );
    const shippingVatCalculation = calculateProductVAT(
      shippingGross,
      taxValue,
      invoiceCountry,
      invoiceTaxId,
    );
    const unitNet = Number(unitVatCalculation.net) || 0;
    const rowNet = unitNet * quantity;
    const shippingNet = Number(shippingVatCalculation.net) || 0;
    const vatRate = Number(unitVatCalculation.vatRate) || 0;
    const rowVat = +(rowGross + shippingGross - (rowNet + shippingNet)).toFixed(
      2,
    );

    return {
      order,
      index,
      quantity,
      unitNet,
      rowNet,
      shippingNet,
      shippingGross,
      rowTotalGross: rowGross + shippingGross,
      vatRate,
      rowVat,
      tax: formatTaxPercent(taxValue),
      idProvider:
        firstItem?.purchased_products?.id_provider ??
        firstItem?.products?.id_provider ??
        "-",
      productName:
        firstItem?.purchased_products?.name ?? firstItem?.products?.name ?? "-",
    };
  });

  const displayGrossTotal = displayRows.reduce(
    (sum, row) => sum + row.rowTotalGross,
    0,
  );
  const displayNetTotal = displayRows.reduce(
    (sum, row) => sum + row.rowNet + row.shippingNet,
    0,
  );

  const taxBuckets = displayRows.reduce(
    (acc, row) => {
      if (Math.abs(row.vatRate - 0.19) < 0.0001) {
        acc.vat19 += row.rowVat;
      } else if (Math.abs(row.vatRate - 0.07) < 0.0001) {
        acc.vat7 += row.rowVat;
      } else {
        acc.otherVat += row.rowVat;
      }

      return acc;
    },
    { vat19: 0, vat7: 0, otherVat: 0 },
  );
  const roundedTaxBuckets = {
    vat19: +taxBuckets.vat19.toFixed(2),
    vat7: +taxBuckets.vat7.toFixed(2),
    otherVat: +taxBuckets.otherVat.toFixed(2),
  };

  const totalVat19 = isGermanyInvoice ? roundedTaxBuckets.vat19 : 0;
  const totalVat7 = isGermanyInvoice ? roundedTaxBuckets.vat7 : 0;
  const totalVatOther = isGermanyInvoice ? roundedTaxBuckets.otherVat : 0;
  // Keep summary fully aligned with table rows:
  // each row contributes G.-Preis + Versand.
  const totalGross = +displayGrossTotal.toFixed(2);
  const totalNet =
    Number.isFinite(displayNetTotal) && displayNetTotal >= 0
      ? +displayNetTotal.toFixed(2)
      : isGermanyInvoice
        ? totalGross - totalVat19 - totalVat7 - totalVatOther
        : totalGross;
  const intraCommunityVat = !isGermanyInvoice && isEuInvoice ? 0 : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "100%",
            flexDirection: "row",
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          <Image
            src="https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/681cde2c-27cd-45ea-94c2-7d82a35453bc_invoice-logo.png?"
            alt="Prestige Home logo"
            style={{ width: 60, height: 50 }}
          />
        </View>

        <View style={styles.header}>
          <View style={{ display: "flex", flexDirection: "column" }}>
            <Text style={{ fontSize: 8, paddingBottom: 20 }}>
              Prestige Home GmbH · Greifswalder Straße 226, 10405 Berlin
            </Text>
            <Text>
              {marketplacePreset?.company_name ??
                orders?.[0]?.checkouts?.[0]?.invoice_address?.recipient_name ??
                ""}
            </Text>
            <Text>
              {marketplacePreset?.invoice_address ??
                orders?.[0]?.checkouts?.[0]?.invoice_address?.address_line ??
                ""}
            </Text>
            <Text>
              {marketplacePreset?.invoice_postal_code ??
                orders?.[0]?.checkouts?.[0]?.invoice_address?.postal_code ??
                ""}{" "}
              {marketplacePreset?.invoice_city ??
                orders?.[0]?.checkouts?.[0]?.invoice_address?.city ??
                ""}
            </Text>
            <Text>
              {marketplacePreset?.tax_id ??
                orders?.[0]?.checkouts?.[0]?.user?.tax_id ??
                ""}
            </Text>
          </View>

          <View
            style={{
              border: "1pt solid #e6e6e6",
              width: 270,
              fontSize: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                backgroundColor: PDF_GRAY_BG,
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Rechnung</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 115, fontWeight: "bold" }}>
                Belegnummer:
              </Text>
              <Text>{invoiceId}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 115, fontWeight: "bold" }}>
                Rechnungsdatum:
              </Text>
              <Text>{formatDateToNum(new Date())}</Text>
            </View>

            {servicePeriod?.trim() && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ width: 115, fontWeight: "bold" }}>
                  Leistungszeitraum:
                </Text>
                <Text>{servicePeriod.trim()}</Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginTop: 10,
              }}
            >
              <Text style={{ width: 115, fontWeight: "bold" }}>
                Ihre Kundennummer
              </Text>
              <Text></Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 115, fontWeight: "bold" }}>
                Ihr Ansprechpartner
              </Text>
              <Text>Duong Thuy Nguyen</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 10, marginBottom: 22 }}>
          {introLines.map((line, index) => (
            <Text
              key={`intro-line-${index}`}
              style={
                index === 0
                  ? {
                      fontFamily: "Helvetica-Bold",
                      fontWeight: "bold",
                      fontSize: 14,
                      lineHeight: 1.25,
                      marginBottom: line.trim() ? 10 : 4,
                    }
                  : {
                      fontSize: 11,
                      lineHeight: 1.25,
                      marginBottom: line.trim() ? 4 : 8,
                    }
              }
            >
              {line || " "}
            </Text>
          ))}
        </View>

        <View
          style={{
            fontSize: 10,
            width: "100%",
            borderBottom: "none",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              borderBottom: "1pt solid #e6e6e6",
              fontWeight: "bold",
              padding: 4,
              backgroundColor: PDF_GRAY_BG,
            }}
          >
            <Text style={{ width: "7%", textAlign: "center", fontSize: 8 }}>
              Pos.
            </Text>
            <Text style={{ width: "12%", fontSize: 8 }}>Ref.-Nr .</Text>
            <Text style={{ width: "12%", fontSize: 8 }}>Artikelnummer</Text>
            <Text style={{ width: "25%", fontSize: 8 }}>Produktname</Text>
            <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
              Versand
            </Text>
            <Text style={{ width: "8%", textAlign: "center", fontSize: 8 }}>
              Menge
            </Text>
            <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
              E.-Preis
            </Text>
            <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
              USt.
            </Text>
            <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
              G.-Preis
            </Text>
          </View>

          {displayRows.map((row) => {
            return (
              <View
                key={row.order.id}
                wrap={false}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  borderBottom: "1pt solid #ccc",
                  padding: 4,
                  alignItems: "center",
                }}
              >
                <Text style={{ width: "7%", textAlign: "center", fontSize: 8 }}>
                  {row.index + 1}
                </Text>
                <Text style={{ width: "12%", fontSize: 8 }}>
                  {row.order.marketplace_order_id ||
                    row.order.checkout_code ||
                    row.order.id}
                </Text>
                <Text style={{ width: "12%", fontSize: 8 }}>
                  {truncateText(row.idProvider)}
                </Text>
                <Text style={{ width: "25%", fontSize: 8 }}>
                  {truncateText(String(row.productName), 70)}
                </Text>
                <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
                  {formatEur(row.shippingNet)}
                </Text>
                <Text style={{ width: "8%", textAlign: "center", fontSize: 8 }}>
                  {row.quantity}
                </Text>
                <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
                  {formatEur(row.unitNet)}
                </Text>
                <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
                  {row.tax}
                </Text>
                <Text style={{ width: "10%", textAlign: "right", fontSize: 8 }}>
                  {formatEur(row.rowNet)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 18 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: PDF_GRAY_BG,
              paddingVertical: 4,
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ width: "60%", fontSize: 8 }}>
              Gesamtbetrag netto
            </Text>
            <Text style={{ width: "40%", textAlign: "right", fontSize: 8 }}>
              {formatEur(totalNet)}
            </Text>
          </View>

          {isGermanyInvoice ? (
            <>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ width: "60%", fontSize: 8 }}>
                  Umsatzsteuer 19%
                </Text>
                <Text style={{ width: "40%", textAlign: "right", fontSize: 8 }}>
                  {formatEur(totalVat19)}
                </Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ width: "60%", fontSize: 8 }}>
                  Umsatzsteuer 7%
                </Text>
                <Text style={{ width: "40%", textAlign: "right", fontSize: 8 }}>
                  {formatEur(totalVat7)}
                </Text>
              </View>

              {totalVatOther > 0 && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ width: "60%", fontSize: 8 }}>
                    Weitere Umsatzsteuer
                  </Text>
                  <Text
                    style={{ width: "40%", textAlign: "right", fontSize: 8 }}
                  >
                    {formatEur(totalVatOther)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            intraCommunityVat !== null && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ width: "60%", fontSize: 8 }}>
                  Innergemeinschaftliche Lieferung 0%
                </Text>
                <Text style={{ width: "40%", textAlign: "right", fontSize: 8 }}>
                  {formatEur(intraCommunityVat)}
                </Text>
              </View>
            )
          )}

          {/* {shippingGrossTotal > 0 && (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ width: "60%" }}>Versandkosten</Text>
              <Text style={{ width: "40%", textAlign: "right" }}>
                {formatEur(shippingGrossTotal)}
              </Text>
            </View>
          )} */}

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: PDF_GRAY_BG,
              paddingVertical: 4,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                width: "60%",
                fontFamily: "Helvetica-Bold",
                fontWeight: "bold",
                fontSize: 8,
              }}
            >
              Gesamtbetrag brutto
            </Text>
            <Text
              style={{
                width: "40%",
                textAlign: "right",
                fontFamily: "Helvetica-Bold",
                fontWeight: "bold",
                fontSize: 8,
              }}
            >
              {formatEur(totalGross)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          {paymentLines.map((line, index) => (
            <Text
              key={`payment-line-${index}`}
              style={{
                fontSize: 11,
                lineHeight: 1.25,
                marginBottom: line.trim() ? 4 : 8,
              }}
            >
              {line || " "}
            </Text>
          ))}
        </View>

        <B2BInvoiceFooter />
        <Text
          fixed
          style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            marginTop: 6,
            textAlign: "center",
            fontSize: 8,
            fontWeight: "bold",
          }}
          render={({ pageNumber, totalPages }) =>
            `Seite ${pageNumber} von ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};
