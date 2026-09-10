import {
  Document,
  Page,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "@bwip-js/browser";

export interface SpeditionLabelData {
  recipient: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    countryCode: string;
  };
  orderCode: string;
  sku: string;
  productName: string;
  parcelNumber: number;
  parcelCount: number;
  weightKg: number | string;
  sscc: string;
  reference: string;
  createdAt: string;
  deliveryNote?: string;
  sender?: string;
}

interface SpeditionLabelPdfProps {
  data: SpeditionLabelData;
}

const styles = StyleSheet.create({
  page: {
    width: "105mm",
    height: "148mm",
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    paddingBottom: 7,
  },
  warehouse: { fontSize: 18, fontWeight: "bold" },
  headerRight: { alignItems: "flex-end" },
  parcelLabel: { fontSize: 14, fontWeight: "bold" },
  subtitle: { fontSize: 7, marginTop: 3 },
  section: { borderBottomWidth: 1, borderBottomColor: "#111111", paddingVertical: 7 },
  sectionTitle: { fontSize: 7, fontWeight: "bold", marginBottom: 5 },
  recipientName: { fontSize: 12, fontWeight: "bold", marginBottom: 3 },
  bodyText: { fontSize: 9, lineHeight: 1.25 },
  detailRow: { flexDirection: "row", marginBottom: 3 },
  detailLabel: { width: 52, fontSize: 7, fontWeight: "bold" },
  detailValue: { flex: 1, fontSize: 8 },
  sscc: { alignItems: "center", paddingVertical: 7 },
  ssccText: { fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginTop: 3 },
  barcodeText: { fontSize: 7, marginTop: 3 },
  referenceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  referenceText: { flex: 1 },
  referenceValue: { fontSize: 9, fontWeight: "bold", marginBottom: 3 },
  createdAt: { fontSize: 7 },
  deliveryNote: { fontSize: 8, marginTop: 5 },
  sender: { marginTop: "auto", borderTopWidth: 1, borderTopColor: "#111111", paddingTop: 6, fontSize: 7 },
});

const Barcode = ({ value }: { value: string }) => {
  if (!value) return null;

  const barcode = bwipjs.raw({
    bcid: "gs1-128",
    text: `(00)${value}`,
    parse: true,
  })[0];

  if (!barcode || !("sbs" in barcode)) return null;

  const scale = 1.55;
  let x = 4;

  return (
    <Svg width={238} height={36} viewBox="0 0 238 36">
      {barcode.sbs.map((barWidth, index) => {
        const bar = index % 2 === 0 ? (
          <Rect
            key={index}
            x={x}
            y={2}
            width={barWidth * scale}
            height={28}
            fill="#111111"
          />
        ) : null;

        x += barWidth * scale;
        return bar;
      })}
    </Svg>
  );
};

export const SpeditionLabelPdf = ({ data }: SpeditionLabelPdfProps) => (
  <Document>
    <Page size="A6" style={styles.page} wrap={false}>
      <View style={styles.header}>
        <Text style={styles.warehouse}>WAREHOUSE</Text>
        <View style={styles.headerRight}>
          <Text style={styles.parcelLabel}>{data.recipient.countryCode || "--"}</Text>
          <Text style={styles.subtitle}>INTERNAL PARCEL LABEL</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SHIP TO</Text>
        <Text style={styles.recipientName}>{data.recipient.name || "-"}</Text>
        <Text style={styles.bodyText}>{data.recipient.street || "-"}</Text>
        <Text style={styles.bodyText}>
          {data.recipient.postalCode || "-"} {data.recipient.city || "-"}, {data.recipient.countryCode || "-"}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ORDER</Text>
          <Text style={styles.detailValue}>{data.orderCode || "-"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>SKU</Text>
          <Text style={styles.detailValue}>{data.sku || "-"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PRODUCT</Text>
          <Text style={styles.detailValue}>{data.productName || "-"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PARCEL</Text>
          <Text style={styles.detailValue}>{data.parcelNumber} / {data.parcelCount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>WEIGHT</Text>
          <Text style={styles.detailValue}>{data.weightKg} kg</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SSCC</Text>
        <View style={styles.sscc}>
          <Barcode value={data.sscc} />
          <Text style={styles.ssccText}>
            {data.sscc ? `00${data.sscc}` : "-"}
          </Text>
          <Text style={styles.barcodeText}>(00) {data.sscc || "-"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>REFERENCE</Text>
        <View style={styles.referenceText}>
          <Text style={styles.referenceValue}>{data.reference || "-"}</Text>
          <Text style={styles.createdAt}>Created: {data.createdAt || "-"}</Text>
          {data.deliveryNote ? <Text style={styles.deliveryNote}>{data.deliveryNote}</Text> : null}
        </View>
      </View>

      <Text style={styles.sender}>SENDER{data.sender ? `\n${data.sender}` : ""}</Text>
    </Page>
  </Document>
);
