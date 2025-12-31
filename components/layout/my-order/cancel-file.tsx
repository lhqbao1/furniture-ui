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
import { useMemo } from "react";
import { getCountryName } from "@/lib/country-name";
import {
  calculateOrderTaxWithDiscount,
  calculateProductVAT,
} from "@/lib/caculate-vat";
import { FooterSection } from "../pdf/file-footer";

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

interface CancelInvoicePDFProps {
  checkout: CheckOutMain;
  invoice: InvoiceResponse;
}

export const CancelInvoicePDF = ({
  checkout,
  invoice,
}: CancelInvoicePDFProps) => {
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
            <Text>
              {invoice.main_checkout.checkouts?.[0]?.user?.company_name ?? ""}
            </Text>
            <Text>
              {invoice.main_checkout.checkouts?.[0]?.user?.company_name
                ? "" // Nếu company_name có → không hiện dòng này
                : checkout.checkouts?.[0]?.invoice_address?.recipient_name
                ? checkout.checkouts[0].invoice_address.recipient_name
                : `${checkout.checkouts?.[0]?.user?.first_name ?? ""} ${
                    checkout.checkouts?.[0]?.user?.last_name ?? ""
                  }`}
            </Text>
            <Text>
              {" "}
              {checkout?.checkouts?.[0]?.invoice_address?.address_line?.trim()
                ? checkout?.checkouts?.[0]?.invoice_address?.address_line
                : checkout?.checkouts?.[0]?.shipping_address?.address_line}
            </Text>
            <Text>
              {checkout?.checkouts?.[0]?.invoice_address?.additional_address_line?.trim()
                ? checkout?.checkouts?.[0]?.invoice_address
                    ?.additional_address_line
                : checkout?.checkouts?.[0]?.shipping_address
                    ?.additional_address_line}
            </Text>
            <Text>
              {checkout?.checkouts?.[0]?.invoice_address?.postal_code?.trim()
                ? checkout?.checkouts?.[0]?.invoice_address?.postal_code
                : checkout?.checkouts?.[0]?.shipping_address?.postal_code}{" "}
              {checkout?.checkouts?.[0]?.invoice_address?.city?.trim()
                ? checkout?.checkouts?.[0]?.invoice_address?.city
                : checkout?.checkouts?.[0]?.shipping_address?.city}
            </Text>
            <Text>
              {getCountryName(
                checkout?.checkouts?.[0]?.invoice_address?.country?.trim()
                  ? checkout?.checkouts?.[0]?.invoice_address?.country
                  : checkout?.checkouts?.[0]?.shipping_address?.country ?? "",
              )}
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

        {/* Credit note intro */}
        <View style={{ fontSize: 10, marginBottom: 10 }}>
          <Text>Stornorechnung Nr. {invoice.invoice_code}-S</Text>
          <Text>
            Zur Rechnung Nr. {invoice.invoice_code} vom{" "}
            {formatDateToNum(invoice.created_at)}
          </Text>

          <View style={{ marginTop: 10 }}>
            <Text>Sehr geehrte Damen und Herren,</Text>
          </View>

          <View style={{ marginTop: 6 }}>
            <Text>
              wir stornieren hiermit die Rechnung Nr. {invoice.invoice_code} vom{" "}
              {formatDateToNum(invoice.created_at)} mit folgenden Positionen:
            </Text>
          </View>
        </View>

        {/*Table */}
        <View
          style={{
            fontSize: 10,
            width: "100%",
            borderBottom: "none",
            marginTop: 10,
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
              backgroundColor: "#ededed",
            }}
          >
            <Text style={{ width: "8%", textAlign: "center" }}>Pos.</Text>
            <Text style={{ width: "44%" }}>Beschreibung</Text>
            <Text style={{ width: "12%", textAlign: "center" }}>Menge</Text>
            <Text style={{ width: "18%", textAlign: "right" }}>
              Einzelpreis
            </Text>
            <Text style={{ width: "18%", textAlign: "right" }}>
              Gesamtpreis
            </Text>
          </View>

          {flattenedCartItems.map((item, index) => {
            const totalPrice = item.final_price * -1;

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
                <Text style={{ width: "8%", textAlign: "center" }}>
                  {index + 1}
                </Text>

                <View style={{ width: "44%" }}>
                  <Text>{item.products.name}</Text>
                </View>

                <Text style={{ width: "12%", textAlign: "center" }}>
                  {item.quantity.toFixed(2)}
                </Text>

                <Text style={{ width: "18%", textAlign: "right" }}>
                  {(item.item_price * -1).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </Text>

                <Text style={{ width: "18%", textAlign: "right" }}>
                  {totalPrice.toLocaleString("de-DE", {
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
            marginTop: 15,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              width: "45%",
              border: "1pt solid #ccc",
            }}
          >
            {/* Zwischensumme */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 6,
                borderBottom: "1pt solid #ccc",
              }}
            >
              <Text>Zwischensumme</Text>
              <Text>
                {(invoice.total_amount_item * -1).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Text>
            </View>

            {/* MwSt */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 6,
                borderBottom: "1pt solid #ccc",
              }}
            >
              <Text>zzgl. Umsatzsteuer 19 %</Text>
              <Text>
                {(
                  calculateOrderTaxWithDiscount(
                    invoice.main_checkout.checkouts
                      .flatMap((c) => c.cart)
                      .flatMap((c) => c.items),
                    invoice.voucher_amount,
                    invoice.main_checkout.checkouts[0].shipping_address.country,
                    invoice.main_checkout.checkouts[0].user.tax_id,
                  ).totalVat * -1
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Text>
            </View>

            {/* Gesamtbetrag */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 6,
                backgroundColor: "#ededed",
                fontWeight: "bold",
              }}
            >
              <Text>Gesamtbetrag</Text>
              <Text>
                {(
                  (invoice.total_amount_item +
                    calculateOrderTaxWithDiscount(
                      invoice.main_checkout.checkouts
                        .flatMap((c) => c.cart)
                        .flatMap((c) => c.items),
                      invoice.voucher_amount,
                      invoice.main_checkout.checkouts[0].shipping_address
                        .country,
                      invoice.main_checkout.checkouts[0].user.tax_id,
                    ).totalVat) *
                  -1
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Text>
            </View>
          </View>
        </View>

        {/* Credit note explanation */}
        <View style={{ fontSize: 10, marginTop: 12 }}>
          <Text>
            Diese Stornorechnung stellt eine vollständige Korrektur der oben
            genannten Originalrechnung dar. Sämtliche Forderungen aus der
            Originalrechnung entfallen hiermit.
          </Text>

          <View style={{ marginTop: 6 }}>
            <Text>
              Sie erhalten in Kürze eine neue, korrekte Rechnung mit den
              aktualisierten Angaben. Bitte entschuldigen Sie die
              Unannehmlichkeiten.
            </Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text>Mit freundlichen Grüßen</Text>
            <Text style={{ marginTop: 8 }}>Vorname Nachname</Text>
          </View>
        </View>

        {/* Footer */}
        <FooterSection />
      </Page>
    </Document>
  );
};
