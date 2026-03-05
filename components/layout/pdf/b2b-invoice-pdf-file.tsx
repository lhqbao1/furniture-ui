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
import { B2BInvoiceFooterSection } from "./b2b-invoice-footer";

Font.register({
  family: "Figtree",
  src: "/fonts/Figtree/Figtree-VariableFont_wght.ttf",
});

interface B2BInvoicePDFFileProps {
  invoiceId: string;
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

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 145,
    fontSize: 11,
    fontFamily: "Figtree",
    color: "#666666",
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

export const B2BInvoicePDFFile = ({
  invoiceId,
  introText,
  paymentNote,
  orders,
}: B2BInvoicePDFFileProps) => {
  const selectedMarketplace =
    orders?.[0]?.from_marketplace?.toLowerCase() ?? "";
  const marketplacePreset = PRESET_BY_MARKETPLACE[selectedMarketplace] ?? null;
  const compactIntroText = introText.replace(/\n{2,}/g, "\n");
  const compactPaymentNote = paymentNote.replace(/\n{2,}/g, "\n");
  const subtotal = orders.reduce(
    (sum, order) => sum + (Number(order.total_amount) || 0),
    0,
  );

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
              <Text style={{ width: 90, fontWeight: "bold" }}>Datum:</Text>
              <Text>{formatDateToNum(new Date())}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ width: 90, fontWeight: "bold" }}>Bearbeiter:</Text>
              <Text>Duong Thuy Nguyen</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 10, marginBottom: 22 }}>
          {compactIntroText.split("\n").map((line, index) => (
            <Text
              key={`${line}-${index}`}
              style={{ marginBottom: 1, lineHeight: 1.05 }}
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

        <View
          style={{ marginTop: 18, display: "flex", alignItems: "flex-end" }}
        >
          <View style={{ width: "100%" }}>
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
                Rechnungsbetrag (brutto)
              </Text>
              <Text
                style={{
                  width: "30%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {subtotal.toLocaleString("de-DE", {
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
                backgroundColor: PDF_GRAY_BG,
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
                  width: "30%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {subtotal.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                €
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          {compactPaymentNote.split("\n").map((line, index) => (
            <Text
              key={`${line}-${index}`}
              style={{ marginBottom: 1, lineHeight: 1.05 }}
            >
              {line || " "}
            </Text>
          ))}
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
