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
  column: {
    width: "30%",
  },
  bold: {
    // fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    fontSize: 8,
  },
  gap: {
    marginBottom: 3,
    fontSize: 8,
  },
  rightText: {
    marginBottom: 3,
    fontSize: 8,
    textAlign: "right",
  },
});

export const FooterSection = () => (
  <View fixed style={styles.footerWrapper}>
    {/* COLUMN 1 */}
    <View style={{ width: "38%" }}>
      <Text style={styles.bold}>Prestige Home GmbH</Text>
      <Text style={styles.gap}>Greifswalder Straße 226</Text>
      <Text style={styles.gap}>10405 Berlin</Text>
      <Text style={styles.gap}>info@prestige-home.de</Text>
    </View>

    {/* COLUMN 2 */}
    <View style={{ width: "42%" }}>
      <Text style={styles.bold}>Bankverbindung</Text>
      <Text style={styles.gap}>OLINDA Zweigniederlassung Deutschland</Text>
      <Text style={styles.gap}>IBAN: DE57100101232316418882</Text>
      <Text style={styles.gap}>BIC: QNTODEB2XXX</Text>
    </View>

    {/* COLUMN 3 */}
    <View style={{ width: "20%", alignItems: "flex-end" }}>
      <Text style={styles.rightText}>Geschäftsführung</Text>
      <Text style={styles.rightText}>Marco Oberste</Text>
      <Text style={styles.rightText}>Duong Thuy Nguyen</Text>
      <Text style={styles.rightText}>Ust-IdNr: DE454714336</Text>
    </View>
  </View>
);
