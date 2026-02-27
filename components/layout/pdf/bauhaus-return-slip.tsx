import { formatDateToNum } from "@/lib/ios-to-num";
import { CheckOutMain } from "@/types/checkout";
import { InvoiceResponse } from "@/types/invoice";
import { CartItem } from "@/types/cart";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { useMemo } from "react";
import { getCountryName } from "@/lib/country-name";

Font.register({
  family: "Roboto",
  src: "/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf",
});

Font.register({
  family: "RobotoBlack",
  src: "/fonts/Roboto/static/Roboto-Black.ttf",
});

Font.register({
  family: "RobotoSemiBold",
  src: "/fonts/Roboto/static/Roboto-SemiBold.ttf",
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
    paddingHorizontal: 34,
    paddingVertical: 28,
    fontSize: 9.5,
    fontFamily: "Roboto",
    color: "#1f1f1f",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  logoWrap: {
    width: "55%",
  },
  titleWrap: {
    width: "45%",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "RobotoBlack",
    marginTop: 8,
  },
  subTitle: {
    fontSize: 8.6,
    fontFamily: "RobotoSemiBold",
    marginBottom: 6,
  },
  addressBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  addressLeft: {
    width: "55%",
  },
  addressRight: {
    width: "40%",
  },
  label: {
    fontFamily: "RobotoSemiBold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  rowLabel: {
    width: 135,
  },
  text: {
    fontSize: 8.2,
    lineHeight: 1.35,
  },
  textBold: {
    fontSize: 8.2,
    fontFamily: "RobotoBlack",
  },
  paragraph: {
    fontSize: 8.2,
    lineHeight: 1.4,
    marginBottom: 7,
  },
  smallText: {
    fontSize: 8.2,
    lineHeight: 1.5,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#8f8f8f",
    position: "relative",
  },
  tableBody: {
    position: "relative",
  },
  headerBar: {
    borderBottomWidth: 0.8,
    borderColor: "#8f8f8f",
  },
  rowWrap: {
    position: "relative",
    borderBottomWidth: 0.8,
    borderColor: "#8f8f8f",
  },
  rowContent: {
    flexDirection: "row",
    minHeight: 24,
    paddingVertical: 2,
  },
  cell: {
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  cellShade: {
    backgroundColor: "#e6e6e6",
  },
  cellContent: {
    paddingHorizontal: 6,
    fontSize: 8.2,
    lineHeight: 1.2,
  },
  headerText: {
    fontSize: 8.2,
    lineHeight: 1.1,
  },
  gridLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 0.8,
    borderColor: "#8f8f8f",
  },
  gridLineRow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 0.8,
    borderColor: "#8f8f8f",
  },
  colPos: { width: "8%", textAlign: "center" },
  colNumber: { width: "18%" },
  colName: { width: "32%" },
  colQty: { width: "14%", textAlign: "center" },
  colReturnQty: { width: "14%", textAlign: "center" },
  colReason: { width: "14%", textAlign: "center" },
  thanks: {
    fontFamily: "RobotoBlack",
    fontSize: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  link: {
    color: "#0a58ca",
    textDecoration: "underline",
  },
  sectionDivider: {
    marginTop: 12,
    marginBottom: 10,
  },
  smallTitle: {
    fontSize: 8.2,
    fontFamily: "RobotoBlack",
    textDecoration: "underline",
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  footerCol: {
    width: "32%",
    fontSize: 8.8,
    lineHeight: 1.35,
  },
  notice: {
    marginTop: 8,
    fontSize: 8.8,
    lineHeight: 1.35,
  },
  reasonsBox: {
    marginTop: 8,
    backgroundColor: "#e6e6e6",
    padding: 8,
  },
  reasonsTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textDecoration: "underline",
    fontSize: 9.2,
  },
  reasonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  reasonsCol: {
    fontSize: 8.2,
    lineHeight: 1.35,
    maxWidth: 280,
    marginRight: 30,
    marginBottom: 8,
  },
  lastReasonsCol: {
    fontSize: 8.2,
    lineHeight: 1.35,
    maxWidth: 280,
    marginRight: 30,
  },
  footerNote: {
    fontSize: 8.2,
    lineHeight: 1.35,
    marginTop: 8,
  },
});

interface BauhausReturnSlipProps {
  checkout: CheckOutMain;
  invoice: InvoiceResponse;
}

export const BauhausReturnSlipPdf = ({
  checkout,
  invoice,
}: BauhausReturnSlipProps) => {
  const flattenedCartItems = useMemo(() => {
    const checkouts =
      invoice?.main_checkout?.checkouts ?? checkout?.checkouts ?? [];

    return checkouts
      .filter((c) => {
        const status = c.status?.toLowerCase();
        return status !== "exchange" && status !== "cancel_exchange";
      })
      .flatMap((c) => {
        if (Array.isArray(c.cart)) {
          return c.cart.flatMap((cartItem) => cartItem.items ?? []);
        }
        return c.cart?.items ?? [];
      });
  }, [checkout, invoice]);

  const firstCheckout =
    invoice?.main_checkout?.checkouts?.[0] ?? checkout?.checkouts?.[0];
  const user = firstCheckout?.user;
  const invoiceAddress = firstCheckout?.invoice_address;
  const shippingAddress = firstCheckout?.shipping_address;
  const useInvoiceAddress =
    invoiceAddress?.address_line && invoiceAddress.address_line.trim().length;
  const address = useInvoiceAddress ? invoiceAddress : shippingAddress;

  const recipientName =
    user?.company_name ||
    invoiceAddress?.recipient_name ||
    shippingAddress?.recipient_name ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  const addressLines = [
    // recipientName,
    "TESTBESTELLUNG BAUHAUS",
    "PAMELA KLAIC",
    address?.address_line,
    address?.additional_address_line,
    `${address?.postal_code ?? ""} ${address?.city ?? ""}`.trim(),
    address?.country ? getCountryName(address.country) : "",
    address?.phone_number
      ? `Tel.Nr.: ${address.phone_number}`
      : "Tel.Nr: 062139051000",
  ].filter((line) => line && String(line).trim().length > 0);

  const rows: Array<CartItem | null> = [...flattenedCartItems];
  while (rows.length < 6) rows.push(null);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            <Image
              src="https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/z7569876933918_a369102b01a9698141928f5c1ad2b1df.png?"
              style={{ width: 155, height: 32 }}
            />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Liefer- und Retourenschein</Text>
          </View>
        </View>

        <View style={styles.addressBlock}>
          <View style={styles.addressLeft}>
            <Text style={styles.subTitle}>Lieferadresse:</Text>
            {addressLines.map((line, idx) => (
              <Text key={idx} style={styles.text}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.addressRight}>
            <View style={styles.row}>
              <Text style={[styles.label, styles.rowLabel]}>
                Auftragsnummer:
              </Text>
              <Text>
                {/* {checkout.checkout_code ?? invoice?.invoice_code ?? "—"} */}
                1048174124
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, styles.rowLabel]}>
                Online-Bestellnummer:
              </Text>
              <Text>
                {/* {checkout.marketplace_order_id ?? "—"} */}
                39221612
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, styles.rowLabel]}>Bestelldatum:</Text>
              <Text>
                {/* {formatDateToNum(checkout.created_at)} */}
                23.02.2026
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.thanks}>BAUHAUS dankt für Ihren Einkauf!</Text>
        <Text style={styles.paragraph}>
          Wir hoffen Sie sind mit Ihrer Bestellung zufrieden. Sollten Sie Fragen
          oder Anliegen zu Ihrer bestehenden Bestellung haben wenden Sie sich
          bitte mit Ihrer Online-Bestellnummer an unser Kontakt Center
          telefonisch unter <Text style={styles.textBold}>0621 3905 1000</Text>{" "}
          (kostenfrei aus dem deutschen Festnetz. Montag bis Freitag 8:00 -
          20:00 Uhr und Samstag 8:00 - 18:00 Uhr) oder per Kontaktformular unter{" "}
          <Text style={styles.link}>www.bauhaus.info/kontakt</Text>
        </Text>
        <Text style={styles.paragraph}>
          Falls Sie sich anders entschieden haben: Kein Problem! Sie können die
          Produkte* jederzeit innerhalb der nächsten 30 Tage zurückgeben. Bitte
          füllen Sie hierzu die folgende Tabelle aus und achten Sie auf die
          darunter stehenden Retourehinweise für eine schnelle und einfache
          Retoure. Legen Sie anschließend diesen{" "}
          <Text style={styles.textBold}>Liefer-/Retourenschein</Text> der
          Retouresendung mit bei. Alternativ können Sie Ihre Produkte in einem
          unserer Fachcentren zurückgeben. Bitte nehmen Sie hierzu Ihre Rechnung
          mit.
        </Text>

        <View style={styles.table}>
          <View style={styles.headerBar}>
            <View style={[styles.gridLine, { left: "8%" }]} />
            <View style={[styles.gridLine, { left: "26%" }]} />
            <View style={[styles.gridLine, { left: "58%" }]} />
            <View style={[styles.gridLine, { left: "72%" }]} />
            <View style={[styles.gridLine, { left: "86%" }]} />

            <View style={styles.headerRow}>
              <View style={[styles.cell, styles.colPos]}>
                <View style={styles.cellContent}>
                  <Text style={[styles.headerText, { textAlign: "center" }]}>
                    Pos.
                  </Text>
                  <Text style={[styles.headerText, { textAlign: "center" }]}>
                    Nr.
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, styles.colNumber]}>
                <Text style={[styles.headerText, styles.cellContent]}>
                  Produktnummer
                </Text>
              </View>
              <View style={[styles.cell, styles.colName]}>
                <Text style={[styles.headerText, styles.cellContent]}>
                  Produktbezeichnung
                </Text>
              </View>
              <View style={[styles.cell, styles.colQty]}>
                <Text
                  style={[
                    styles.headerText,
                    styles.cellContent,
                    { textAlign: "center" },
                  ]}
                >
                  Liefermenge
                </Text>
              </View>
              <View style={[styles.cell, styles.colReturnQty]}>
                <Text
                  style={[
                    styles.headerText,
                    styles.cellContent,
                    { textAlign: "center" },
                  ]}
                >
                  Retourenmenge
                </Text>
              </View>
              <View style={[styles.cell, styles.colReason]}>
                <Text
                  style={[
                    styles.headerText,
                    styles.cellContent,
                    { textAlign: "center" },
                  ]}
                >
                  Retourengrund
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.tableBody}>
            {/* {rows.map((item, idx) => (
              <View key={idx} style={styles.rowWrap}>
                <View style={[styles.gridLineRow, { left: "8%" }]} />
                <View style={[styles.gridLineRow, { left: "26%" }]} />
                <View style={[styles.gridLineRow, { left: "58%" }]} />
                <View style={[styles.gridLineRow, { left: "72%" }]} />
                <View style={[styles.gridLineRow, { left: "86%" }]} />

                <View style={styles.rowContent}>
                  <View style={[styles.cell, styles.colPos]}>
                    <Text style={[styles.cellContent, { textAlign: "center" }]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colNumber]}>
                    <Text style={styles.cellContent}>
                      {item?.products?.id_provider ?? " "}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colName]}>
                    <Text style={styles.cellContent}>
                      {item?.products?.name ?? " "}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colQty]}>
                    <Text style={[styles.cellContent, { textAlign: "center" }]}>
                      {item?.quantity ?? " "}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colReturnQty]}>
                    <Text style={styles.cellContent}> </Text>
                  </View>
                  <View style={[styles.cell, styles.colReason]}>
                    <Text style={styles.cellContent}> </Text>
                  </View>
                </View>
              </View>
            ))} */}
            <View style={styles.rowWrap}>
              <View style={[styles.gridLineRow, { left: "8%" }]} />
              <View style={[styles.gridLineRow, { left: "26%" }]} />
              <View style={[styles.gridLineRow, { left: "58%" }]} />
              <View style={[styles.gridLineRow, { left: "72%" }]} />
              <View style={[styles.gridLineRow, { left: "86%" }]} />

              <View style={styles.rowContent}>
                <View style={[styles.cell, styles.colPos]}>
                  <Text style={[styles.cellContent, { textAlign: "center" }]}>
                    1
                  </Text>
                </View>
                <View style={[styles.cell, styles.colNumber]}>
                  <Text style={styles.cellContent}>33754376</Text>
                </View>
                <View style={[styles.cell, styles.colName]}>
                  <Text style={styles.cellContent}>
                    KLAPPBARER LIEGESTUHL ADIRONDACK BR AUN
                  </Text>
                </View>
                <View style={[styles.cell, styles.colQty]}>
                  <Text style={[styles.cellContent, { textAlign: "center" }]}>
                    1
                  </Text>
                </View>
                <View style={[styles.cell, styles.colReturnQty]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
                <View style={[styles.cell, styles.colReason]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
              </View>
            </View>
            <View style={styles.rowWrap}>
              <View style={[styles.gridLineRow, { left: "8%" }]} />
              <View style={[styles.gridLineRow, { left: "26%" }]} />
              <View style={[styles.gridLineRow, { left: "58%" }]} />
              <View style={[styles.gridLineRow, { left: "72%" }]} />
              <View style={[styles.gridLineRow, { left: "86%" }]} />

              <View style={styles.rowContent}>
                <View style={[styles.cell, styles.colPos]}>
                  <Text style={[styles.cellContent, { textAlign: "center" }]}>
                    2
                  </Text>
                </View>
                <View style={[styles.cell, styles.colNumber]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colName]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colQty]}>
                  <Text
                    style={[styles.cellContent, { textAlign: "center" }]}
                  ></Text>
                </View>
                <View style={[styles.cell, styles.colReturnQty]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
                <View style={[styles.cell, styles.colReason]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
              </View>
            </View>
            <View style={styles.rowWrap}>
              <View style={[styles.gridLineRow, { left: "8%" }]} />
              <View style={[styles.gridLineRow, { left: "26%" }]} />
              <View style={[styles.gridLineRow, { left: "58%" }]} />
              <View style={[styles.gridLineRow, { left: "72%" }]} />
              <View style={[styles.gridLineRow, { left: "86%" }]} />

              <View style={styles.rowContent}>
                <View style={[styles.cell, styles.colPos]}>
                  <Text style={[styles.cellContent, { textAlign: "center" }]}>
                    3
                  </Text>
                </View>
                <View style={[styles.cell, styles.colNumber]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colName]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colQty]}>
                  <Text
                    style={[styles.cellContent, { textAlign: "center" }]}
                  ></Text>
                </View>
                <View style={[styles.cell, styles.colReturnQty]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
                <View style={[styles.cell, styles.colReason]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
              </View>
            </View>
            <View style={styles.rowWrap}>
              <View style={[styles.gridLineRow, { left: "8%" }]} />
              <View style={[styles.gridLineRow, { left: "26%" }]} />
              <View style={[styles.gridLineRow, { left: "58%" }]} />
              <View style={[styles.gridLineRow, { left: "72%" }]} />
              <View style={[styles.gridLineRow, { left: "86%" }]} />

              <View style={styles.rowContent}>
                <View style={[styles.cell, styles.colPos]}>
                  <Text style={[styles.cellContent, { textAlign: "center" }]}>
                    4
                  </Text>
                </View>
                <View style={[styles.cell, styles.colNumber]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colName]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colQty]}>
                  <Text
                    style={[styles.cellContent, { textAlign: "center" }]}
                  ></Text>
                </View>
                <View style={[styles.cell, styles.colReturnQty]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
                <View style={[styles.cell, styles.colReason]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
              </View>
            </View>
            <View style={styles.rowWrap}>
              <View style={[styles.gridLineRow, { left: "8%" }]} />
              <View style={[styles.gridLineRow, { left: "26%" }]} />
              <View style={[styles.gridLineRow, { left: "58%" }]} />
              <View style={[styles.gridLineRow, { left: "72%" }]} />
              <View style={[styles.gridLineRow, { left: "86%" }]} />

              <View style={styles.rowContent}>
                <View style={[styles.cell, styles.colPos]}>
                  <Text style={[styles.cellContent, { textAlign: "center" }]}>
                    5
                  </Text>
                </View>
                <View style={[styles.cell, styles.colNumber]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colName]}>
                  <Text style={styles.cellContent}></Text>
                </View>
                <View style={[styles.cell, styles.colQty]}>
                  <Text
                    style={[styles.cellContent, { textAlign: "center" }]}
                  ></Text>
                </View>
                <View style={[styles.cell, styles.colReturnQty]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
                <View style={[styles.cell, styles.colReason]}>
                  <Text style={styles.cellContent}> </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerCol}>
            <Text style={styles.smallTitle}>
              Für eine schnelle und fehlerfreie Retoure:
            </Text>
            <Text style={styles.smallText}>1. Retourenschein ausgefüllt?</Text>
            <Text style={styles.smallText}>2. Produkt sicher verpackt?</Text>
            <Text style={styles.smallText}>
              3. Paketinhalt auf Vollständigkeit geprüft?
            </Text>
            <Text style={styles.smallText}>
              4. Retourenschein ins Paket gelegt?
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.smallTitle}>Retoure Paketversendung:</Text>
            <Text style={styles.smallText}>
              Paketware aus einer Online-Bestellung kann kostenfrei mit dem
              beiliegenden Retourenlabel dem entsprechenden Paketdienstleister
              übergeben werden. Sollte Ihnen das Retourenlabel nicht vorliegen,
              wenden Sie sich bitte an unser Kontakt Center unter{" "}
              <Text style={styles.textBold}>0621 3905 1000</Text> oder{" "}
              <Text style={styles.link}>www.bauhaus.info/kontakt</Text>
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.smallTitle}>Retoure Speditionssendung:</Text>
            <Text>
              Sollte es sich bei Ihrer Retoure um Sperrgut handeln wenden Sie
              sich bitte an unser Kontakt Center unter{" "}
              <Text style={styles.textBold}>0621 3905 1000</Text> oder{" "}
              <Text style={styles.link}>www.bauhaus.info/kontakt</Text>
            </Text>
          </View>
        </View>

        <Text style={[styles.textBold, styles.notice]}>
          Bitte dringend beachten:
        </Text>
        <Text style={styles.notice}>
          Bei Rücksendungen kraftstoffbetriebener Produkte müssen diese zwingend
          vollständig entleert ohne Inhaltsreste (z.B. Kraftstoffe o.ä.)
          versendet werden!
        </Text>

        <View style={styles.reasonsBox}>
          <Text style={styles.reasonsTitle}>Retourengründe:</Text>
          <View style={styles.reasonsRow}>
            <View style={styles.reasonsCol}>
              <Text>1. Produkt entspricht nicht den Erwartungen</Text>
            </View>
            <View style={styles.reasonsCol}>
              <Text>
                2. Produkt entspricht nicht der Produktbeschreibung/Abbildung
              </Text>
            </View>
            <View style={styles.reasonsCol}>
              <Text>3. Zu spät geliefert</Text>
            </View>
            <View style={styles.reasonsCol}>
              <Text>4. Unvollständig geliefert</Text>
            </View>
            <View style={styles.reasonsCol}>
              <Text>
                5. Beschädigt geliefert (Verpackung oder Produkt beschädigt)
              </Text>
            </View>
            <View style={styles.reasonsCol}>
              <Text>6. Produkt defekt (funktioniert nicht)</Text>
            </View>
            <View style={styles.reasonsCol}>
              <Text>7. Falsches Produkt bestellt (z.B. Größe, Farbe)</Text>
            </View>
            <View style={styles.lastReasonsCol}>
              <Text>8. Falsches Produkt geliefert (z.B. Größe, Farbe)</Text>
            </View>
            <View style={styles.lastReasonsCol}>
              <Text>9. Zu viel bestellt</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Die Lieferung erfolgt im Auftrag der BAUHAUS E-Business GmbH & Co. KG,
          Gutenbergstraße 21, 68167 Mannheim
        </Text>
        <Text style={styles.footerNote}>
          *Informationen zum Widerrufsrecht entnehmen Sie bitte der
          E-Mail-Bestätigung Ihrer Bestellung oder unseren Allgemeinen
          Geschäftsbedingungen (AGB), zu finden unter{" "}
          <Text style={styles.link}>www.bauhaus.info/agb</Text>
        </Text>
      </Page>
    </Document>
  );
};
