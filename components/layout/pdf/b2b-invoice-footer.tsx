import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footerWrapper: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bold: {
    marginBottom: 3,
    fontSize: 8,
  },
  gap: {
    marginBottom: 3,
    fontSize: 8,
  },
});

export const B2BInvoiceFooterSection = () => (
  <View fixed style={styles.footerWrapper}>
    <View style={{ width: "34%" }}>
      <Text style={styles.bold}>Prestige Home GmbH</Text>
      <Text style={styles.gap}>Greifswalder Straße 226</Text>
      <Text style={styles.gap}>10405 Berlin</Text>
      <Text style={styles.gap}>info@prestige-home.de</Text>
    </View>

    <View style={{ width: "40%", paddingLeft: 18 }}>
      <Text style={styles.bold}>Bankverbindung</Text>
      <Text style={styles.gap}>Deutsche Bank</Text>
      <Text style={styles.gap}>IBAN DE31 1007 0000 0839 7895 00</Text>
      <Text style={styles.gap}>BIC DEUTDEFFXXX</Text>
    </View>

    <View style={{ width: "26%", alignItems: "flex-end" }}>
      <Text style={styles.bold}>Geschäftsführung</Text>
      <Text style={styles.gap}>Marco Oberste</Text>
      <Text style={styles.gap}>Duong Thuy Nguyen</Text>
      <Text style={styles.gap}>Ust-IdNr: DE454714336</Text>
    </View>
  </View>
);
