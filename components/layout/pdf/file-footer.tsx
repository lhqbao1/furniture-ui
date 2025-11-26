import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footerWrapper: {
    position: "absolute",
    bottom: 10,
    left: 48,
    right: 48,
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
});

export const FooterSection = () => (
  <View style={styles.footerWrapper}>
    {/* COLUMN 1 */}
    <View style={{ width: "38%" }}>
      <Text style={styles.bold}>Prestige Home GmbH</Text>
      <Text style={styles.gap}>Greifswalder Straße 226</Text>
      <Text style={styles.gap}>10405 Berlin</Text>
      <Text style={styles.gap}>info@prestige-home.de</Text>
    </View>

    {/* COLUMN 2 */}
    <View style={{ width: "42%" }}>
      <Text style={styles.bold}>Kontoverbindung</Text>
      <Text style={styles.gap}>OLINDA Zweigniederlassung Deutschland</Text>
      <Text style={styles.gap}>IBAN: DE57100101232316418882</Text>
      <Text style={styles.gap}>BIC: QNTODEB2XXX</Text>
    </View>

    {/* COLUMN 3 */}
    <View style={{ width: "20%" }}>
      <Text style={styles.bold}>Geschäftsführung</Text>
      <Text style={styles.gap}>Duong Thuy Nguyen</Text>
      <Text style={styles.gap}>Ust-IdNr: DE454714336</Text>
    </View>
  </View>
);
