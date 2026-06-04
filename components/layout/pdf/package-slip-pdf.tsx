import { formatDateToNum } from "@/lib/ios-to-num";
import { filterInvoiceCheckouts } from "@/lib/checkout-filter";
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
import { FooterSection } from "./file-footer";
import { getCountryName } from "@/lib/country-name";

import { CartItem } from "@/types/cart";

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

export const PackageSlipPdf = ({ checkout, invoice }: InvoicePDFProps) => {
  const filteredCheckouts = useMemo(
    () =>
      filterInvoiceCheckouts(
        invoice?.main_checkout?.checkouts ?? checkout?.checkouts,
      ),
    [checkout?.checkouts, invoice?.main_checkout?.checkouts],
  );
  const firstCheckout = filteredCheckouts[0];

  const flattenedCartItems = useMemo(() => {
    return (
      filteredCheckouts
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
  }, [filteredCheckouts]);

  const transformCartItems = (cartItems: CartItem[]): CartItem[] => {
    return cartItems.flatMap((item) => {
      const product = item.products;

      if (product.bundles && product.bundles.length > 0) {
        // Tách ra các dòng con
        return product.bundles.map((bundle) => ({
          ...item,
          products: bundle.bundle_item, // thay thế bằng sản phẩm con
          quantity: bundle.quantity * item.quantity, // dùng số lượng của bundle
        }));
      }

      // Không có bundles thì giữ nguyên
      return item;
    });
  };

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
              {firstCheckout?.user.company_name
                ? firstCheckout.user.company_name
                : firstCheckout?.shipping_address?.recipient_name
                  ? firstCheckout.shipping_address.recipient_name
                  : `${firstCheckout?.user?.first_name ?? ""} ${
                      firstCheckout?.user?.last_name ?? ""
                    }`}
            </Text>

            <Text>
              {firstCheckout?.shipping_address?.address_line?.trim()
                ? firstCheckout.shipping_address.address_line
                : firstCheckout?.invoice_address?.address_line}
            </Text>
            <Text>
              {firstCheckout?.shipping_address?.additional_address_line?.trim()
                ? firstCheckout.shipping_address.additional_address_line
                : firstCheckout?.invoice_address?.additional_address_line}
            </Text>
            <Text>
              {firstCheckout?.shipping_address?.postal_code?.trim()
                ? firstCheckout.shipping_address.postal_code
                : firstCheckout?.invoice_address?.postal_code}{" "}
              {firstCheckout?.shipping_address?.city?.trim()
                ? firstCheckout.shipping_address.city
                : firstCheckout?.invoice_address?.city}
            </Text>
            <Text>
              {getCountryName(
                firstCheckout?.shipping_address?.country?.trim()
                  ? firstCheckout.shipping_address.country
                  : (firstCheckout?.invoice_address?.country ?? ""),
              )}
            </Text>

            {firstCheckout?.shipping_address?.email ? (
              <Text>Email: {firstCheckout.shipping_address.email}</Text>
            ) : (
              ""
            )}
            <Text>
              Tel: {firstCheckout?.shipping_address.phone_number}
            </Text>
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
              <Text style={{ fontWeight: "bold" }}>Lieferschein</Text>
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
              <Text>{checkout.checkouts[0].checkout_code ?? ""}</Text>
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
              <Text style={{ width: 80, fontWeight: "bold" }}>
                Referenz-Nr.:
              </Text>
              <Text>{checkout.marketplace_order_id}</Text>
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
            <Text style={{ width: "10%", textAlign: "center" }}>Lfd. Nr.</Text>
            <Text style={{ width: "25%", textAlign: "center" }}>
              Artikel ID
            </Text>
            <Text style={{ width: "55%" }}>Artikelbezeichnung</Text>
            <Text style={{ width: "10%", textAlign: "center" }}>Menge</Text>
          </View>

          {/* Item 1 */}
          {transformCartItems(flattenedCartItems).map((item, index) => {
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
                <Text style={{ width: "10%", textAlign: "center" }}>
                  {index + 1}
                </Text>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  {item.products.sku}
                </Text>
                <Text style={{ width: "60%", textAlign: "left" }}>
                  {item.products.name}
                  {"\n"}
                  {item.products.ean}
                </Text>
                <View style={{ width: "10%", textAlign: "center" }}>
                  <Text>{item.quantity}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <FooterSection />
      </Page>
    </Document>
  );
};
