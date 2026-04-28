import { formatDateToNum } from "@/lib/ios-to-num";
import { CheckOutMain } from "@/types/checkout";
import { InvoiceResponse } from "@/types/invoice";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import { FooterSection } from "./file-footer";
import { getCountryName } from "@/lib/country-name";
import {
  calculateCartItemDisplayPricing,
  calculateDisplayOrderTaxSummary,
} from "@/lib/caculate-vat";

const deploymentBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

const normalizedDeploymentBaseUrl = deploymentBaseUrl.replace(/\/$/, "");
const resolvePdfFontSrc = (path: string) =>
  typeof window === "undefined"
    ? `${normalizedDeploymentBaseUrl}${path}`
    : path;

Font.register({
  family: "Roboto",
  src: resolvePdfFontSrc("/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf"),
});

Font.register({
  family: "Figtree",
  src: resolvePdfFontSrc("/fonts/Figtree/Figtree-VariableFont_wght.ttf"),
});

Font.register({
  family: "FigtreeBold",
  src: resolvePdfFontSrc("/fonts/Figtree/figtree-bold.ttf"),
});

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 132,
    fontSize: 11,
    fontFamily: "Figtree",
    fontWeight: "bold",
    color: "#1f1f1f",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 20,
  },
  section: { marginBottom: 10 },
  gapY10: { marginBottom: 5, marginRight: 20 },
  gapBoldY10: { marginBottom: 5, marginRight: 20, fontFamily: "Figtree" },
  gapY5: { marginBottom: 0 },
  minWidth: {
    // minWidth: 100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  flexEnd: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    flexDirection: "row",
    marginTop: 30,
    flex: 1,
  },
  tableHeader: { flexDirection: "row", paddingBottom: 10 },
  tableRow: { flexDirection: "row", paddingVertical: 10 },
  tableCol: { flex: 1, paddingHorizontal: 5 },
  tableColPosition: { width: "50px", textAlign: "center" },
  tableColQuantity: { flex: 1, textAlign: "center" },
  tableColName: { flex: 1 },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#1f1f1f",
  },
  footer: {
    marginTop: 50,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    fontSize: 9,
  },
  bold: { fontWeight: "bold" },
  text: { fontFamily: "Roboto", fontSize: 12 },
  flexColBlock: { display: "flex", flexDirection: "column" },
  flexColBlockWithTop: {
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
    marginBottom: 10,
    fontSize: 10,
  },

  flexRowBlock: { display: "flex", flexDirection: "row", gap: "4px" },
  boldWithGap: { fontFamily: "FigtreeBold" },
  flexEndTotal: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    flexDirection: "row",
  },
  right5: { marginRight: 5 },
  flexEndTotalBg: {
    display: "flex",
    justifyContent: "flex-end",
    width: "300px",
    flexDirection: "row",
    backgroundColor: "rgba(81, 190, 140, 0.2)",
    borderRadius: 6,
    paddingTop: 5,
    paddingBottom: 2,
  },
});

interface InvoicePDFProps {
  checkout: CheckOutMain;
  invoice: InvoiceResponse;
}

const normalizeRecipientName = (value?: string | null) =>
  (value ?? "").replace(/\s{2,}/g, " ").trim();

export const RouteInvoicePDF = ({ checkout, invoice }: InvoicePDFProps) => {
  const checkouts = invoice?.main_checkout?.checkouts ?? [];
  const flattenedCartItems = checkouts
    .filter((checkoutItem) => {
      const status = checkoutItem.status?.toLowerCase();
      return status !== "exchange" && status !== "cancel_exchange";
    })
    .flatMap((checkoutItem) => {
      if (Array.isArray(checkoutItem.cart)) {
        return checkoutItem.cart.flatMap((cartItem) => cartItem.items ?? []);
      }
      return checkoutItem.cart?.items ?? [];
    });

  const primaryCheckout = checkout?.checkouts?.[0];
  const useShippingAddressForInvoice =
    (checkout?.from_marketplace ?? "").toLowerCase() === "ebay";
  const addressForInvoice = useShippingAddressForInvoice
    ? (primaryCheckout?.shipping_address ?? primaryCheckout?.invoice_address)
    : primaryCheckout?.invoice_address;
  const checkoutCountryCode =
    checkout?.checkouts?.[0]?.shipping_address?.country ??
    checkout?.checkouts?.[0]?.invoice_address?.country ??
    "DE";
  const checkoutTaxId = invoice?.main_checkout?.checkouts?.[0]?.user?.tax_id;
  const paymentTermDays = Number(invoice?.payment_term);
  const resolvedPaymentTermDays =
    Number.isFinite(paymentTermDays) && paymentTermDays > 0
      ? String(paymentTermDays)
      : "XX";
  const shipperDateRaw =
    checkout?.checkouts?.[0]?.shipment?.shipper_date?.trim();
  const hasServicePeriod = Boolean(shipperDateRaw);
  const servicePeriodValue = hasServicePeriod
    ? formatDateToNum(shipperDateRaw ?? "") || shipperDateRaw || ""
    : "";
  const marketplaceReference = checkout?.marketplace_order_id?.trim() ?? "";
  const hasMarketplaceReference = marketplaceReference.length > 0;

  const orderTaxSummary = calculateDisplayOrderTaxSummary(
    flattenedCartItems,
    invoice?.voucher_amount,
    checkoutCountryCode,
    checkoutTaxId,
    checkout?.total_shipping,
  );

  const mappedVatRows = (orderTaxSummary?.buckets ?? [])
    .map((bucket) => {
      const rawRate = Number(bucket?.vatRate) || 0;
      const normalizedRate = rawRate > 1 ? rawRate / 100 : rawRate;
      const percent = normalizedRate * 100;

      return {
        percent,
        vat: Number(bucket?.vat) || 0,
      };
    })
    .filter((row) => Number.isFinite(row.percent))
    .sort((a, b) => b.percent - a.percent);

  const vatRows =
    mappedVatRows.length > 0
      ? mappedVatRows
      : [
          {
            percent: 0,
            vat: Number(orderTaxSummary?.totalVat) || 0,
          },
        ];

  const introLines = [
    "Rechnung",
    "Sehr geehrte Damen und Herren,",
    "vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!",
    "Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:",
  ];

  const paymentLines = [
    "Zahlungsbedingungen:",
    `Zahlung innerhalb von ${resolvedPaymentTermDays} Tagen ab Rechnungseingang ohne Abzüge. Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene Konto.`,
  ];
  const isWaitingForPayment =
    (checkout?.status ?? "").toLowerCase() === "pending";

  const giftCouponGross =
    (invoice?.coupon_amount ?? 0) + Math.abs(invoice?.voucher_amount ?? 0);
  const showGiftCouponRow = giftCouponGross > 0;
  const refundDiscountGross = Math.abs(
    Number(invoice?.main_checkout?.refund_amount ?? checkout?.refund_amount ?? 0),
  );
  const showRefundDiscountRow = refundDiscountGross > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Logo */}
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

        {/* Customer & Invoice Info */}
        <View style={styles.header}>
          <View style={styles.flexColBlock}>
            <Text style={{ fontSize: 8, paddingBottom: 20 }}>
              Prestige Home GmbH · Greifswalder Straße 226, 10405 Berlin
            </Text>

            {/* Invoice Address */}
            <Text>
              {invoice.main_checkout.checkouts?.[0]?.user?.company_name ?? ""}
            </Text>
            <Text>
              {invoice.main_checkout.checkouts?.[0]?.user?.company_name
                ? "" // Nếu company_name có → không hiện dòng này
                : addressForInvoice?.recipient_name?.trim()
                  ? normalizeRecipientName(addressForInvoice.recipient_name)
                  : normalizeRecipientName(
                      `${checkout.checkouts?.[0]?.user?.first_name ?? ""} ${
                        checkout.checkouts?.[0]?.user?.last_name ?? ""
                      }`,
                    )}
            </Text>
            <Text>
              {addressForInvoice?.address_line?.trim()
                ? addressForInvoice?.address_line
                : ""}
            </Text>
            <Text>
              {addressForInvoice?.additional_address_line?.trim()
                ? addressForInvoice?.additional_address_line
                : ""}
            </Text>
            <Text>
              {addressForInvoice?.postal_code?.trim()
                ? addressForInvoice?.postal_code
                : ""}{" "}
              {addressForInvoice?.city?.trim() ? addressForInvoice?.city : ""}
            </Text>
            <Text>
              {getCountryName(
                addressForInvoice?.country?.trim()
                  ? addressForInvoice.country
                  : "",
              )}
            </Text>
            <Text>{checkout?.checkouts?.[0]?.user?.tax_id ?? ""}</Text>
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
            {/* Header */}
            <View
              style={{
                backgroundColor: "#ededed",
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Rechnung</Text>
            </View>

            {/* Rows */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 115, fontWeight: "bold" }}>
                Rechnungs-Nr:
              </Text>
              <Text>{invoice.invoice_code}</Text>
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
              <Text>{formatDateToNum(invoice.created_at)}</Text>
            </View>

            {hasServicePeriod && (
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
                <Text>{servicePeriodValue}</Text>
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
                Ihre Kundennummer:
              </Text>
              {/* <Text>1011</Text> */}
            </View>

            {hasMarketplaceReference && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ width: 115, fontWeight: "bold" }}>
                  Referenz:
                </Text>
                <Text>{marketplaceReference}</Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 115, fontWeight: "bold" }}>
                Ihr Ansprechpartner:
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
                      fontSize: 12,
                      lineHeight: 1.25,
                      marginBottom: line.trim() ? 10 : 4,
                    }
                  : {
                      fontSize: 9,
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
            fontSize: 9,
            width: "100%",
            borderBottom: "none",
          }}
        >
          {/* Header row */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              borderBottom: "1pt solid #e6e6e6",
              fontWeight: "bold",
              padding: 4,
              backgroundColor: "#D2D2D2",
            }}
          >
            <Text style={{ width: "6%", textAlign: "center" }}>Pos.</Text>
            <Text style={{ width: "14%" }}>Art.-Nr.</Text>
            <Text style={{ width: "38%" }}>Bezeichnung</Text>
            <Text style={{ width: "10%", textAlign: "center" }}>Menge</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>MwSt.</Text>
            <Text style={{ width: "11%", textAlign: "right" }}>E.-Preis</Text>
            <Text style={{ width: "11%", textAlign: "right" }}>G.-Preis</Text>
          </View>

          {/* Item 1 */}
          {flattenedCartItems.map((item, index) => {
            const { quantity, unitNet, vatRate, lineNet } =
              calculateCartItemDisplayPricing(
                item,
                checkoutCountryCode,
                checkoutTaxId,
              );
            const vatPercent = vatRate * 100;

            return (
              <View
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  borderBottom: "1pt solid #ccc",
                  padding: 4,
                }}
              >
                <Text style={{ width: "6%", textAlign: "center" }}>
                  {index + 1}
                </Text>
                <Text style={{ width: "14%" }}>
                  {item.products.id_provider}
                </Text>
                <View style={{ width: "38%" }}>
                  <Text>{item.products.name}</Text>
                </View>
                <Text style={{ width: "10%", textAlign: "center" }}>
                  {quantity}
                </Text>
                <Text style={{ width: "10%", textAlign: "right" }}>
                  {vatPercent.toLocaleString("de-DE", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  %
                </Text>
                <Text style={{ width: "11%", textAlign: "right" }}>
                  {unitNet.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </Text>
                <Text style={{ width: "11%", textAlign: "right" }}>
                  {lineNet.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View
          style={{
            fontSize: 9,
            width: "100%",
            marginTop: 10,
            borderBottom: "1pt solid #e6e6e6",
          }}
        >
          {/* Net and VAT */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingVertical: 3,
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ width: "60%", textAlign: "right" }}>
              Warenwert (netto)
            </Text>
            <Text style={{ width: "20%", textAlign: "right" }}>
              {(Number(orderTaxSummary?.totalNetWithoutShipping) || 0).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {" €"}
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingVertical: 3,
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ width: "60%", textAlign: "right" }}>
              Versandkosten (netto)
            </Text>
            <Text style={{ width: "20%", textAlign: "right" }}>
              {(Number(orderTaxSummary?.shipping?.net) || 0).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
              {" €"}
            </Text>
          </View>

          {/* Invoice total */}
          {/* <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            paddingVertical: 4,
                            paddingHorizontal: 6,
                            fontWeight: 'bold',
                        }}
                    >
                        <Text style={{ width: '60%', textAlign: 'right' }}>Summe (netto)</Text>
                        <Text style={{ width: '20%', textAlign: 'right' }}>
                            {((invoice?.total_amount ?? 0) - (invoice?.total_vat ?? 0)).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                        </Text>
                    </View> */}

          <View>
            {vatRows.map((row, index) => (
              <View
                key={`vat-row-${index}-${row.percent}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    width: "60%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Mehrwertsteuer{" "}
                  {row.percent.toLocaleString("de-DE", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  %
                </Text>
                <Text
                  style={{
                    width: "20%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {row.vat.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {" €"}
                </Text>
              </View>
            ))}

            {showGiftCouponRow && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    width: "60%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Wertgutschein (brutto)
                </Text>
                <Text
                  style={{
                    width: "20%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {giftCouponGross.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {" €"}
                </Text>
              </View>
            )}

            {showRefundDiscountRow && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    width: "60%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Rabatt (Rückerstattung, brutto)
                </Text>
                <Text
                  style={{
                    width: "20%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  -{" "}
                  {refundDiscountGross.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {" €"}
                </Text>
              </View>
            )}

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                backgroundColor: "#ededed",
                paddingVertical: 3,
                paddingHorizontal: 6,
              }}
            >
              <Text
                style={{
                  width: "60%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Rechnungsbetrag (brutto)
              </Text>
              <Text
                style={{
                  width: "20%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {(Number(orderTaxSummary?.totalGross) || 0).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {" €"}
              </Text>
            </View>

            {/* {checkout.status.toLowerCase() === "pending" ? (
              ""
            ) : (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    width: "60%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Zahlung vom {formatDateToNum(invoice.created_at)}
                </Text>
                <Text
                  style={{
                    width: "20%",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {(
                    (invoice?.total_amount_item ?? 0) +
                    (invoice?.total_shipping ?? 0) -
                    Math.abs(invoice?.voucher_amount ?? 0)
                  ).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {" €"}
                </Text>
              </View>
            )} */}

            {/* <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingVertical: 3,
                paddingHorizontal: 6,
              }}
            >
              <Text
                style={{
                  width: "60%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Offener Betrag
              </Text>
              <Text
                style={{
                  width: "20%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {checkout.status.toLowerCase() === "pending"
                  ? (
                      (invoice?.total_amount_item ?? 0) +
                      (invoice?.total_shipping ?? 0) -
                      Math.abs(invoice?.voucher_amount ?? 0)
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "00,00"}
                {" €"}
              </Text>
            </View> */}
          </View>
        </View>

        <View style={styles.flexColBlockWithTop}>
          <Text style={{ marginBottom: 2, fontSize: 9 }}>Lieferadresse:</Text>
          <Text style={{ fontSize: 9 }}>
            {normalizeRecipientName(
              invoice.main_checkout.checkouts?.[0]?.shipping_address
                ?.recipient_name,
            )}
          </Text>

          <Text style={{ fontSize: 9 }}>
            {checkout?.checkouts?.[0]?.shipping_address?.address_line?.trim()
              ? checkout?.checkouts?.[0]?.shipping_address?.address_line
              : ""}
          </Text>
          <Text style={{ fontSize: 9 }}>
            {checkout?.checkouts?.[0]?.shipping_address?.additional_address_line?.trim()
              ? checkout?.checkouts?.[0]?.shipping_address
                  ?.additional_address_line
              : ""}
          </Text>
          <Text style={{ fontSize: 9 }}>
            {checkout?.checkouts?.[0]?.shipping_address?.postal_code?.trim()
              ? checkout?.checkouts?.[0]?.shipping_address?.postal_code
              : ""}{" "}
            {checkout?.checkouts?.[0]?.shipping_address?.city?.trim()
              ? checkout?.checkouts?.[0]?.shipping_address?.city
              : ""}
          </Text>
          <Text style={{ fontSize: 9 }}>
            {getCountryName(
              checkout?.checkouts?.[0]?.shipping_address?.country?.trim()
                ? checkout?.checkouts?.[0]?.shipping_address?.country
                : "",
            )}
          </Text>
        </View>

        {isWaitingForPayment && (
          <View style={{ marginTop: 12 }}>
            {paymentLines.map((line, index) => (
              <Text
                key={`payment-line-${index}`}
                style={{
                  fontSize: 9,
                  lineHeight: 1.25,
                  marginBottom: line.trim() ? 4 : 8,
                }}
              >
                {line || " "}
              </Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <FooterSection />
      </Page>
    </Document>
  );
};
