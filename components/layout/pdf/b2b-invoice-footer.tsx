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
  text: {
    marginBottom: 4,
    fontSize: 8,
    color: "#de8400",
    lineHeight: 1.15,
  },
});

export const B2BInvoiceFooterSection = () => (
  <View fixed style={styles.footerWrapper}>
    <View style={{ width: "25%" }}>
      <Text style={styles.text}>Prestige Home GmbH</Text>
      <Text style={styles.text}>Greifswalder Str. 226</Text>
      <Text style={styles.text}>10405 Berlin</Text>
      <Text style={styles.text}>Deutschland</Text>
    </View>

    <View style={{ width: "25%" }}>
      <Text style={styles.text}>Tel. +49 15206576549</Text>
      <Text style={styles.text}>E-Mail duong@prestige-home.de</Text>
      <Text style={styles.text}>Web https://www.prestige-home.de/de</Text>
    </View>

    <View style={{ width: "27%" }}>
      <Text style={styles.text}>Amtsgericht Charlottenburg</Text>
      <Text style={styles.text}>HR-Nr. HRB 274256 B</Text>
      <Text style={styles.text}>USt.-ID DE454714336</Text>
      <Text style={styles.text}>Steuer-Nr. 37/478/50199</Text>
      <Text style={styles.text}>Geschäftsführung Duong Thuy Nguyen</Text>
    </View>

    <View style={{ width: "23%" }}>
      <Text style={styles.text}>Bank Deutsche Bank</Text>
      <Text style={styles.text}>IBAN DE31 1007 0000 0839 7895 00</Text>
      <Text style={styles.text}>BIC DEUTDEFFXXX</Text>
    </View>
  </View>
);
