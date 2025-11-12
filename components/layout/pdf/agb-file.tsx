import { ChildLegalPolicy, LegalPolicy } from "@/types/policy";
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
    color: "#444",
  },
  title: {
    textAlign: "center",
    textTransform: "uppercase",
    color: "#00B159",
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.4,
  },
});

interface InvoicePDFProps {
  contentHtml: ChildLegalPolicy[];
}

export const InvoicePDF = ({ contentHtml }: InvoicePDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            textAlign: "center",
            textTransform: "uppercase",
            color: "#00B159",
            paddingVertical: 20,
          }}
        >
          Allgemeine Geschäftsbedingungen (AGB)
        </View>

        <View>
          {contentHtml.map((item, index) => {
            return (
              <View key={item.id}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.content}>{item.content}</Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};
