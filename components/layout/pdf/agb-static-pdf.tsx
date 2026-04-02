import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { htmlToText } from "html-to-text";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontSize: 10,
    color: "#1f1f1f",
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d9d9d9",
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#444",
  },
  block: {
    marginBottom: 8,
  },
});

interface AGBStaticPDFProps {
  html: string;
}

export function AGBStaticPDF({ html }: AGBStaticPDFProps) {
  const plainText = htmlToText(html || "", {
    preserveNewlines: true,
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  })
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const blocks = plainText
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.title}>Prestige Home GmbH - AGB</Text>
          <Text style={styles.subtitle}>www.prestige-home.de</Text>
        </View>

        {blocks.map((block, index) => (
          <Text key={`agb-block-${index}`} style={styles.block}>
            {block}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
