import { formatDate } from "@/lib/date-formated";
import { formatDateToNum, formatIOSDate } from "@/lib/ios-to-num";
import { CheckOut, CheckOutMain, CheckOutMainResponse } from "@/types/checkout";
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
import { useMemo } from "react";
import { FooterSection } from "./file-footer";
import { calculateVAT } from "@/lib/caculate-vat";
import { getCountryName } from "@/lib/country-name";

Font.register({
  family: "Roboto",
  src: "/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf",
});

Font.register({
  family: "Figtree",
  src: "/fonts/Figtree/Figtree-VariableFont_wght.ttf",
});

Font.register({
  family: "FigtreeBold",
  src: "/fonts/Figtree/figtree-bold.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Figtree",
    fontWeight: "bold",
    color: "#666666",
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
    color: "#00B159",
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

export const InvoicePDF = ({ checkout, invoice }: InvoicePDFProps) => {
  const flattenedCartItems = useMemo(() => {
    const checkouts = invoice?.main_checkout?.checkouts;
    if (!checkouts) return [];

    return (
      checkouts
        // ❌ Loại checkout có status "exchange" hoặc "cancel_exchange"
        .filter((checkout) => {
          const status = checkout.status?.toLowerCase();
          return status !== "exchange" && status !== "cancel_exchange";
        })

        // ✔ Flatten items
        .flatMap((checkout) => {
          // Nếu checkout.cart là array (CartResponse)
          if (Array.isArray(checkout.cart)) {
            return checkout.cart.flatMap((cartItem) => cartItem.items ?? []);
          }

          // Nếu checkout.cart là object (CartResponseItem)
          return checkout.cart?.items ?? [];
        })
    );
  }, [invoice]);

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
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
            style={{ width: 80, height: 70 }}
          />
        </View>

        {/* Customer & Invoice Info */}
        <View style={styles.header}>
          <View style={styles.flexColBlock}>
            <Text style={{ fontSize: 8 }}>
              Prestige Home GmbH · Greifswalder Straße 226, 10405 Berlin
            </Text>
            <Text>{invoice.main_checkout.checkouts[0].user.company_name}</Text>
            <Text>
              {checkout.checkouts[0].invoice_address.recipient_name
                ? checkout.checkouts[0].invoice_address.recipient_name
                : checkout.checkouts[0].user.last_name +
                  "" +
                  checkout.checkouts[0].user.last_name}
            </Text>
            <Text>{checkout.checkouts[0].invoice_address.address_line}</Text>
            <Text>
              {checkout.checkouts[0].invoice_address.additional_address_line}
            </Text>
            <Text>
              {checkout.checkouts[0].invoice_address.postal_code}{" "}
              {checkout.checkouts[0].invoice_address.city}
            </Text>
            <Text>
              {getCountryName(checkout.checkouts[0].invoice_address.country)}
            </Text>
            <Text>{checkout.checkouts[0].user.tax_id}</Text>
          </View>
          <View
            style={{
              border: "1pt solid #e6e6e6",
              width: 200,
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
              <Text style={{ width: 80, fontWeight: "bold" }}>
                Belegnummer:
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
              <Text style={{ width: 80, fontWeight: "bold" }}>Datum:</Text>
              <Text>{formatDateToNum(checkout.created_at)}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 80, fontWeight: "bold" }}>Kunden-Nr:</Text>
              <Text>{checkout.checkouts[0].user.user_code}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 80, fontWeight: "bold" }}>Bearbeiter:</Text>
              <Text>–</Text>
            </View>

            {/* Footer note */}
            <View
              style={{
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 9,
                  fontWeight: "bold",
                }}
              >
                Bitte bei allen Rückfragen angeben!
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            fontSize: 10,
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
            <Text style={{ width: "16%" }}>Art.-Nr.</Text>
            <Text style={{ width: "36%" }}>Bezeichnung</Text>
            <Text style={{ width: "10%", textAlign: "center" }}>Menge</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>MwSt.</Text>
            <Text style={{ width: "11%", textAlign: "right" }}>E.-Preis</Text>
            <Text style={{ width: "11%", textAlign: "right" }}>G.-Preis</Text>
          </View>

          {/* Item 1 */}
          {flattenedCartItems.map((item, index) => {
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
                <Text style={{ width: "16%" }}>
                  {item.products.id_provider}
                </Text>
                <View style={{ width: "36%" }}>
                  <Text>{item.products.name}</Text>
                </View>
                <Text style={{ width: "10%", textAlign: "center" }}>
                  {item.quantity}
                </Text>
                <Text style={{ width: "10%", textAlign: "right" }}>
                  {checkout.tax}%
                </Text>
                <Text style={{ width: "11%", textAlign: "right" }}>
                  {item.item_price.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </Text>
                <Text style={{ width: "11%", textAlign: "right" }}>
                  {item.final_price.toLocaleString("de-DE", {
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
            fontSize: 10,
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
              Warenwert (brutto)
            </Text>
            <Text style={{ width: "20%", textAlign: "right" }}>
              {invoice.total_amount_item.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
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
              Versandkosten (brutto)
            </Text>
            <Text style={{ width: "20%", textAlign: "right" }}>
              {(invoice?.total_shipping ?? 0)?.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
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
            <View
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
                MwSt.
              </Text>
              <Text
                style={{
                  width: "20%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {calculateVAT({
                  items: invoice?.total_amount_item,
                  shipping: invoice?.total_shipping,
                  discount: invoice?.voucher_amount,
                  taxPercent: checkout?.tax ?? 19,
                }).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                €
              </Text>
            </View>

            <View
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
                Rechnungsbetrag (brutto)
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
                €
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
                {(
                  (invoice?.coupon_amount ?? 0) +
                  Math.abs(invoice?.voucher_amount ?? 0)
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                €
              </Text>
            </View>

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
                Zahlbetrag
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
                €
              </Text>
            </View>

            {checkout.status.toLowerCase() === "pending" ? (
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
                  Zahlung{" "}
                  <Text style={{ textTransform: "capitalize" }}>
                    ({checkout.from_marketplace ?? checkout.payment_method}
                  </Text>{" "}
                  Managed Payments) vom {formatDateToNum(invoice.created_at)}
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
                  €
                </Text>
              </View>
            )}

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
                €
              </Text>
            </View>
          </View>
        </View>

        {checkout.status.toLowerCase() === "pending" ? (
          <View style={{ marginTop: 10, textAlign: "left", fontSize: 10 }}>
            <Text>
              Zahlungsbedingungen: Zahlung innerhalb von {invoice.payment_term}{" "}
              Tagen ab Rechnungseingang ohne Abzüge.
            </Text>
          </View>
        ) : (
          ""
        )}

        {/* Footer */}
        <FooterSection />
      </Page>
    </Document>
  );
};
