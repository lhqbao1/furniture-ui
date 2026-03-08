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
import { B2BInvoiceFooterSection } from "./b2b-invoice-footer";

Font.register({
  family: "Figtree",
  src: "/fonts/Figtree/Figtree-VariableFont_wght.ttf",
});

interface B2BInvoicePDFFileProps {
  invoiceId: string;
  deliveryAddress: string;
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
    paddingBottom: 145,
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
  deliveryAddress,
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
  const cleanedDeliveryAddress = deliveryAddress.trim().replace(/\.+$/, "");
  const deliveryAddressLine = `Anlieferadresse: ${cleanedDeliveryAddress}.`;
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
  const paymentLine3 =
    paymentLines.find((line) => line === "Konto.") ?? "Konto.";
  const paymentLine4 =
    paymentLines.find((line) =>
      line.startsWith("Der Rechnungsbetrag ist bis zum "),
    ) ?? "";
  const paymentLine5 =
    paymentLines.find((line) => line === "Mit freundlichen Grüßen") ??
    "Mit freundlichen Grüßen";
  const paymentLine6 =
    paymentLines.find((line) => line === "Duong Thuy Nguyen") ??
    "Duong Thuy Nguyen";
  const allCartItems = orders.flatMap((order) =>
    (order.checkouts ?? []).flatMap((checkout) => checkout.cart?.items ?? []),
  );

  const shippingGrossTotal = orders.reduce(
    (sum, order) => sum + (Number(order.total_shipping) || 0),
    0,
  );

  const productGrossTotal = allCartItems.reduce((sum, item) => {
    const unitGross = Number(
      item.purchased_products?.final_price ??
        item.products?.final_price ??
        item.final_price ??
        0,
    );
    const qty = Number(item.quantity) || 0;
    return sum + unitGross * qty;
  }, 0);

  const taxBuckets = allCartItems.reduce(
    (acc, item) => {
      const rawTax = item.purchased_products?.tax ?? item.products?.tax ?? null;
      const rate = parseTaxRate(rawTax);
      const unitGross = Number(
        item.purchased_products?.final_price ??
          item.products?.final_price ??
          item.final_price ??
          0,
      );
      const qty = Number(item.quantity) || 0;
      const gross = unitGross * qty;

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

  const totalNet = isGermanyInvoice ? taxBuckets.net : productGrossTotal;
  const totalVat19 = isGermanyInvoice ? taxBuckets.vat19 : 0;
  const totalVat7 = isGermanyInvoice ? taxBuckets.vat7 : 0;
  const totalVatOther = isGermanyInvoice ? taxBuckets.otherVat : 0;
  const intraCommunityVat = !isGermanyInvoice && isEuInvoice ? 0 : null;
  const totalGross =
    totalNet + totalVat19 + totalVat7 + totalVatOther + shippingGrossTotal;

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
                Rechnungs-Nr.:
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
                Ihre USt-Id.
              </Text>
              <Text>ATU65296645</Text>
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
            {deliveryAddressLine}
          </Text>
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
            <Text style={{ width: "8%", textAlign: "center" }}>Pos.</Text>
            <Text style={{ width: "24%" }}>Ref.-Nr .</Text>
            <Text style={{ width: "30%" }}>Kundenname</Text>
            <Text style={{ width: "8%", textAlign: "center" }}>Menge</Text>
            <Text style={{ width: "15%", textAlign: "right" }}>E.-Preis</Text>
            <Text style={{ width: "15%", textAlign: "right" }}>G.-Preis</Text>
          </View>

          {orders.map((order, index) => {
            const gross = Number(order.total_amount) || 0;
            return (
              <View
                key={order.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  borderBottom: "1pt solid #ccc",
                  padding: 4,
                  alignItems: "center",
                }}
              >
                <Text style={{ width: "8%", textAlign: "center" }}>
                  {index + 1}
                </Text>
                <Text style={{ width: "24%" }}>
                  {order.marketplace_order_id ||
                    order.checkout_code ||
                    order.id}
                </Text>
                <Text style={{ width: "30%" }}>
                  {truncateText(getCustomerName(order))}
                </Text>
                <Text style={{ width: "8%", textAlign: "center" }}>1</Text>
                <Text style={{ width: "15%", textAlign: "right" }}>
                  €
                  {gross.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={{ width: "15%", textAlign: "right" }}>
                  €
                  {gross.toLocaleString("de-DE", {
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
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 2 }}>
            {paymentLine2}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 2 }}>
            {paymentLine3}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 10 }}>
            {paymentLine4}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 2 }}>
            {paymentLine5}
          </Text>
          <Text style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 10 }}>
            {paymentLine6}
          </Text>
        </View>

        <B2BInvoiceFooterSection />
        <Text
          fixed
          style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
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
