import { formatDateToNum } from "@/lib/ios-to-num";
import { parseTaxRate } from "@/lib/parse-tax";
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

const getCustomerName = (checkout: CheckOutMain) => {
  const first = checkout.checkouts?.[0];
  if (!first) return "";

  const shippingRecipient = first?.shipping_address?.recipient_name?.trim();
  if (shippingRecipient) {
    return shippingRecipient;
  }

  const invoiceRecipient = first?.invoice_address?.recipient_name?.trim();
  if (invoiceRecipient) {
    return invoiceRecipient;
  }

  const companyName = first?.user?.company_name?.trim();
  if (companyName) return companyName;

  const fullName =
    `${first?.user?.first_name ?? ""} ${first?.user?.last_name ?? ""}`.trim();
  if (fullName) return fullName;

  return "";
};

const truncateText = (value: string, maxLength = 28) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
};

const formatEur = (value: number) =>
  `${value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;

export const B2BInvoicePDFFile = ({
  invoiceId,
  servicePeriod,
  orderNumber,
  introText: _introText,
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
  const titleLine = cleanedOrderNumber
    ? `Rechnung Nr. ${invoiceId} - Ihre Bestellung ${cleanedOrderNumber}`
    : `Rechnung Nr. ${invoiceId}`;
  const introLine1 = "Sehr geehrte Damen und Herren,";
  const introLine2 =
    "vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!";
  const introLine3 =
    "Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:";

  const paymentLines = paymentNote.split("\n");
  const paymentLine1 =
    paymentLines[0] ??
    "Zahlungsbedingungen: Zahlung innerhalb von 14 Tagen ab Rechnungseingang ohne Abzüge.";
  const paymentLine2 =
    paymentLines.find((line) =>
      line.startsWith(
        "Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer",
      ),
    ) ??
    "Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene";
  const paymentLine4 =
    paymentLines.find((line) =>
      line.startsWith("Der Rechnungsbetrag ist bis zum "),
    ) ?? "";
  // const paymentLine5 =
  //   paymentLines.find((line) => line === "Mit freundlichen Grüßen") ??
  //   "Mit freundlichen Grüßen";
  // const paymentLine6 =
  //   paymentLines.find((line) => line === "Duong Thuy Nguyen") ??
  //   "Duong Thuy Nguyen";
  const displayRows = orders.map((order, index) => {
    const orderItems = (order.checkouts ?? []).flatMap(
      (checkout) => checkout.cart?.items ?? [],
    );
    const firstItem = orderItems[0];
    const quantity =
      orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) ||
      1;
    const unitGross =
      Number(
        firstItem?.purchased_products?.final_price ??
          firstItem?.products?.final_price ??
          firstItem?.final_price ??
          0,
      ) || 0;
    const rowGross = unitGross * quantity;
    const shippingGross = Number(order.total_shipping) || 0;
    const taxRate = parseTaxRate(
      firstItem?.purchased_products?.tax ?? firstItem?.products?.tax ?? null,
    );

    return {
      order,
      index,
      quantity,
      unitGross,
      rowGross,
      shippingGross,
      rowTotalGross: rowGross + shippingGross,
      taxRate,
      idProvider:
        firstItem?.purchased_products?.id_provider ??
        firstItem?.products?.id_provider ??
        "-",
      productName:
        firstItem?.purchased_products?.name ?? firstItem?.products?.name ?? "-",
    };
  });

  const shippingGrossTotal = displayRows.reduce(
    (sum, row) => sum + row.shippingGross,
    0,
  );
  const displayGrossTotal = displayRows.reduce(
    (sum, row) => sum + row.rowTotalGross,
    0,
  );

  const taxBuckets = displayRows.reduce(
    (acc, item) => {
      const rate = item.taxRate;
      const gross = item.rowTotalGross;

      if (rate <= 0) {
        acc.net += gross;
        return acc;
      }

      const net = gross / (1 + rate);
      const vat = gross - net;
      acc.net += net;

      if (Math.abs(rate - 0.19) < 0.0001) {
        acc.vat19 += vat;
      } else if (Math.abs(rate - 0.07) < 0.0001) {
        acc.vat7 += vat;
      } else {
        acc.otherVat += vat;
      }

      return acc;
    },
    { net: 0, vat19: 0, vat7: 0, otherVat: 0 },
  );

  const totalVat19 = isGermanyInvoice ? taxBuckets.vat19 : 0;
  const totalVat7 = isGermanyInvoice ? taxBuckets.vat7 : 0;
  const totalVatOther = isGermanyInvoice ? taxBuckets.otherVat : 0;
  const totalGross = displayGrossTotal;
  const totalNet = isGermanyInvoice
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
            style={{ width: 80, height: 70 }}
          />
        </View>

        <View style={styles.header}>
          <View style={{ display: "flex", flexDirection: "column" }}>
            <Text style={{ fontSize: 8 }}>
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
              width: 220,
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
              <Text style={{ width: 90, fontWeight: "bold" }}>
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
              <Text style={{ width: 90, fontWeight: "bold" }}>
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
                <Text style={{ width: 90, fontWeight: "bold" }}>
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
              <Text style={{ width: 90, fontWeight: "bold" }}>
                Ihre Kundennummer
              </Text>
              <Text>1011</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 90, fontWeight: "bold" }}>
                Ihr Ansprechpartner
              </Text>
              <Text>Duong Thuy Nguyen</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 10, marginBottom: 22 }}>
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontWeight: "bold",
              fontSize: 14,
              marginBottom: 15,
            }}
          >
            {titleLine}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 10 }}>
            {introLine1}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25 }}>{introLine2}</Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 10 }}>
            {introLine3}
          </Text>
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
            <Text style={{ width: "7%", textAlign: "center" }}>Pos.</Text>
            <Text style={{ width: "16%" }}>Ref.-Nr .</Text>
            <Text style={{ width: "14%" }}>Artikelnummer</Text>
            <Text style={{ width: "25%" }}>Produktname</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>Versand</Text>
            <Text style={{ width: "8%", textAlign: "center" }}>Menge</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>E.-Preis</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>G.-Preis</Text>
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
                <Text style={{ width: "7%", textAlign: "center" }}>
                  {row.index + 1}
                </Text>
                <Text style={{ width: "16%" }}>
                  {row.order.marketplace_order_id ||
                    row.order.checkout_code ||
                    row.order.id}
                </Text>
                <Text style={{ width: "14%" }}>
                  {truncateText(row.idProvider)}
                </Text>
                <Text style={{ width: "25%" }}>
                  {truncateText(String(row.productName), 34)}
                </Text>
                <Text style={{ width: "10%", textAlign: "right" }}>
                  €
                  {row.shippingGross.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={{ width: "8%", textAlign: "center" }}>
                  {row.quantity}
                </Text>
                <Text style={{ width: "10%", textAlign: "right" }}>
                  €
                  {row.unitGross.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={{ width: "10%", textAlign: "right" }}>
                  €
                  {row.rowGross.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
            <Text style={{ width: "60%" }}>Gesamtbetrag netto</Text>
            <Text style={{ width: "40%", textAlign: "right" }}>
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
                <Text style={{ width: "60%" }}>Umsatzsteuer 19%</Text>
                <Text style={{ width: "40%", textAlign: "right" }}>
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
                <Text style={{ width: "60%" }}>Umsatzsteuer 7%</Text>
                <Text style={{ width: "40%", textAlign: "right" }}>
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
                  <Text style={{ width: "60%" }}>Weitere Umsatzsteuer</Text>
                  <Text style={{ width: "40%", textAlign: "right" }}>
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
                <Text style={{ width: "60%" }}>
                  Innergemeinschaftliche Lieferung 0%
                </Text>
                <Text style={{ width: "40%", textAlign: "right" }}>
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
              }}
            >
              {formatEur(totalGross)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 10 }}>
            {paymentLine1}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 10 }}>
            {paymentLine4}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 2 }}>
            {paymentLine2}
          </Text>
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
