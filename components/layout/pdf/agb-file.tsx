import { formatDate } from "@/lib/date-formated";
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
import { htmlToText } from "html-to-text";

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
    marginBottom: 5,
    fontSize: 24,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#00B159",
  },
  content: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  field: {
    paddingVertical: 15,
  },
});

interface InvoicePDFProps {
  contentHtml: ChildLegalPolicy[];
  date: Date;
}

export const InvoicePDF = ({ contentHtml, date }: InvoicePDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              textAlign: "left",
              textTransform: "uppercase",
              color: "black",
              marginBottom: 5,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Prestige Home GmbH
          </Text>
          <Text
            style={{
              textAlign: "left",
              color: "black",
              marginBottom: 5,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            https://www.prestige-home.de/
          </Text>
          <Text
            style={{
              textAlign: "left",
              color: "black",
              marginBottom: 5,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            +4915206576549
          </Text>
        </View>

        <View
          style={{
            marginBottom: 20,
          }}
        >
          <Text style={styles.title}>
            Allgemeine Geschäftsbedingungen (AGB)
          </Text>
          <Text
            style={{
              textAlign: "center",
            }}
          >
            Stand: {formatDate(date)}
          </Text>
        </View>

        <View>
          {contentHtml.map((item) => {
            const parsedText = htmlToText(item.content || "", {
              wordwrap: false, // không tự xuống dòng
              preserveNewlines: true,
            });

            return (
              <View key={item.id} style={styles.field}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.content}>{parsedText}</Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};
