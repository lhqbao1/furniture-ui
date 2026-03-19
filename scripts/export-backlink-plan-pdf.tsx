import fs from "node:fs";
import path from "node:path";
import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

type Prospect = {
  domain: string;
  type: string;
  priority: "A" | "B" | "C";
  angle: string;
};

const prospects: Prospect[] = [
  { domain: "selbst.de", type: "DIY editorial", priority: "A", angle: "Gastbeitrag: Holz-Gartenmoebel Pflegeplan" },
  { domain: "myhomebook.de", type: "Home editorial", priority: "A", angle: "Datenstory: Balkon/Fence Trends 2026" },
  { domain: "schoener-wohnen.de", type: "Interior media", priority: "A", angle: "Expertenbeitrag zu Outdoor-Living" },
  { domain: "livingathome.de", type: "Home media", priority: "A", angle: "How-to fuer kleine Terrassen" },
  { domain: "mein-schoener-garten.de", type: "Garden media", priority: "A", angle: "Ratgeber zu Holzzaun-Wartung" },
  { domain: "gartenflora.de", type: "Garden magazine", priority: "A", angle: "Saisonaler Gartenboden-Guide" },
  { domain: "krautundrueben.de", type: "Garden magazine", priority: "B", angle: "Natuerliche Materialien im Aussenbereich" },
  { domain: "haus.de", type: "Home/building", priority: "A", angle: "Vergleich Holz vs WPC fuer Sichtschutz" },
  { domain: "wohnglueck.de", type: "Home portal", priority: "A", angle: "Checkliste Balkon-Upgrade" },
  { domain: "bauen.de", type: "Build portal", priority: "A", angle: "Leitfaden Terrassenplanung" },
  { domain: "brigitte.de", type: "Lifestyle media", priority: "B", angle: "Wohntrends Garten 2026 mit Quellenlink" },
  { domain: "elle.de", type: "Lifestyle media", priority: "B", angle: "Design-Perspektive Outdoor-Moebel" },
  { domain: "freundin.de", type: "Lifestyle media", priority: "B", angle: "Budget-freundliche Gartenideen" },
  { domain: "utopia.de", type: "Sustainability media", priority: "A", angle: "FSC-Holz und Langlebigkeit im Garten" },
  { domain: "focus.de", type: "News/lifestyle", priority: "C", angle: "PR-Daten zu Heimwerken und Garten" },
  { domain: "welt.de", type: "News/lifestyle", priority: "C", angle: "Digitale PR mit Datensatz" },
  { domain: "spiegel.de", type: "News/lifestyle", priority: "C", angle: "Trendreport Gartenprodukte" },
  { domain: "stern.de", type: "News/lifestyle", priority: "C", angle: "Saisonstory mit Expertenzitat" },
  { domain: "sueddeutsche.de", type: "News/lifestyle", priority: "C", angle: "Verbraucherleitfaden Aussenmoebel" },
  { domain: "t-online.de", type: "News/lifestyle", priority: "C", angle: "Kurzstudie zu Preis/Qualitaet" },
  { domain: "houzz.de", type: "Home community", priority: "A", angle: "Projektbeispiele + Profilverlinkung" },
  { domain: "homify.de", type: "Home community", priority: "A", angle: "Expertenprofil + Projekt-Artikel" },
  { domain: "solebich.de", type: "Interior community", priority: "B", angle: "Community-Story mit Produktnutzung" },
  { domain: "frag-mutti.de", type: "Ratgeber community", priority: "B", angle: "Pflege-Tipps fuer Holzoberflaechen" },
  { domain: "gutefrage.net", type: "Q&A community", priority: "B", angle: "Hilfreiche Antworten + Markenrelevanz" },
  { domain: "wer-weiss-was.de", type: "Q&A community", priority: "B", angle: "Expertenantworten zu Materialfragen" },
  { domain: "garten-pur.de", type: "Garden forum", priority: "A", angle: "Fachbeitrag Zaun/Gartenmoebel" },
  { domain: "hausgarten.net", type: "Garden forum", priority: "A", angle: "Praxis-Thread mit Anleitung" },
  { domain: "bauexpertenforum.de", type: "Build forum", priority: "A", angle: "Technikbeitrag zu Konstruktion" },
  { domain: "reddit.com", type: "Community", priority: "C", angle: "Nicht-spammige Brand-Erwaehnung" },
  { domain: "gelbeseiten.de", type: "Citation", priority: "A", angle: "Firmenprofil mit konsistenten NAP-Daten" },
  { domain: "dasoertliche.de", type: "Citation", priority: "A", angle: "Lokale Unternehmensdaten" },
  { domain: "11880.com", type: "Citation", priority: "A", angle: "Branchenprofil + Website-Link" },
  { domain: "meinestadt.de", type: "Citation", priority: "B", angle: "Lokale Sichtbarkeit" },
  { domain: "cylex.de", type: "Citation", priority: "B", angle: "Unternehmensprofil vervollstaendigen" },
  { domain: "golocal.de", type: "Citation", priority: "B", angle: "Bewertungen + Verweis" },
  { domain: "yelp.de", type: "Citation", priority: "B", angle: "Brand-Signal und NAP-Konsistenz" },
  { domain: "provenexpert.com", type: "Review/citation", priority: "A", angle: "Vertrauenssignal + Link" },
  { domain: "trustpilot.com", type: "Review/citation", priority: "A", angle: "Reputation und Markensuche" },
  { domain: "werkenntdenbesten.de", type: "Review/citation", priority: "B", angle: "Branchen-Reputation" },
  { domain: "marktplatz-mittelstand.de", type: "Citation", priority: "B", angle: "Unternehmensprofil" },
  { domain: "wlw.de", type: "B2B directory", priority: "B", angle: "B2B-Sichtbarkeit fuer Lieferpartner" },
  { domain: "idealo.de", type: "Marketplace/comparison", priority: "A", angle: "Brand/Shop Profilstaerkung" },
  { domain: "billiger.de", type: "Marketplace/comparison", priority: "A", angle: "Feed-Qualitaet + Shopsignal" },
  { domain: "geizhals.de", type: "Marketplace/comparison", priority: "A", angle: "Strukturierte Produktsignale" },
  { domain: "check24.de", type: "Comparison platform", priority: "B", angle: "Produktpraesenz + Markensichtbarkeit" },
  { domain: "manomano.de", type: "Marketplace", priority: "B", angle: "Verkaufsprofil + Markenlink" },
  { domain: "ebay.de", type: "Marketplace", priority: "B", angle: "Shopprofil und Autoritaetssignal" },
  { domain: "kaufland.de", type: "Marketplace", priority: "B", angle: "Shop-Marke und Produktabdeckung" },
  { domain: "otto.de", type: "Marketplace", priority: "C", angle: "Kooperation/Brand Erwähnung" },
];

const weekPlan = [
  "W1: Technical audit + backlink baseline (GSC, Ahrefs/Semrush, index health).",
  "W2: Keyword cluster mapping DE (Gartenmoebel, Holzzaun, Sichtschutz, Balkonboden).",
  "W3: Publish Asset #1 (Ratgeber: Holz vs WPC Zaun + Pflege-Checkliste).",
  "W4: Publish Asset #2 (Datenartikel: Preis/Material/Lebensdauer-Vergleich).",
  "W5: Build prospect list + contact enrichment (200 domains, 1-2 contacts/domain).",
  "W6: Outreach wave #1 (Partner, Nischenblogs, Communities) + unlinked mention reclaim.",
  "W7: Digital PR wave (Journalistenpitch mit Datensatz + Visuals).",
  "W8: Supplier/manufacturer partnership links (Haendler/Partnerseiten).",
  "W9: Broken-link + resource-page campaign (DE home/garden resources).",
  "W10: Outreach wave #2 + follow-up + anchor diversification control.",
  "W11: Internal linking reinforcement to money pages + schema tuning.",
  "W12: Reporting + link quality review + next-quarter roadmap.",
];

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 28,
    fontSize: 10.5,
    color: "#1f2937",
    fontFamily: "Helvetica",
    lineHeight: 1.35,
  },
  title: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  bullet: {
    marginBottom: 4,
  },
  noteBox: {
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
  },
  th: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  cNo: { width: 22 },
  cDomain: { width: 120 },
  cType: { width: 90 },
  cPriority: { width: 36 },
  cAngle: { flex: 1 },
  small: { fontSize: 9, color: "#6b7280" },
});

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const BacklinkPlanDocument = () => {
  const prospectChunks = chunk(prospects, 18);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Prestige Home: Backlink Roadmap (Germany)</Text>
        <Text style={styles.subtitle}>
          Version: 19 Mar 2026 | Scope: Furniture, Garden, Wooden Tables/Chairs, Fences
        </Text>

        <View style={styles.noteBox}>
          <Text>
            Objective (90 days): Build high-quality German referring domains to improve rankings for
            commercial clusters around Gartenmoebel, Holzzaun/Sichtschutz, Balkon & Terrasse.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>1) KPI Targets (Quarter 1)</Text>
        <Text style={styles.bullet}>- +30 to +50 net new referring domains (quality-screened).</Text>
        <Text style={styles.bullet}>- +20% non-brand organic clicks on DE category/product pages.</Text>
        <Text style={styles.bullet}>- 60% links to commercial pages, 40% to informational assets.</Text>
        <Text style={styles.bullet}>- Anchor mix: 60% brand/URL, 25% partial match, 15% generic.</Text>

        <Text style={styles.sectionTitle}>2) Compliance Guardrails (Google-safe)</Text>
        <Text style={styles.bullet}>- No paid dofollow links. Sponsored placements must use rel="sponsored".</Text>
        <Text style={styles.bullet}>- UGC links should use rel="ugc" or nofollow.</Text>
        <Text style={styles.bullet}>- Avoid PBN/link exchanges at scale and exact-match anchor overuse.</Text>
        <Text style={styles.bullet}>- Prioritize editorial relevance, topical fit, and traffic-bearing pages.</Text>

        <Text style={styles.sectionTitle}>3) Required On-site Assets (before outreach)</Text>
        <Text style={styles.bullet}>- Asset A: "Holzzaun vs WPC Zaun" (cost, durability, maintenance).</Text>
        <Text style={styles.bullet}>- Asset B: "Gartenmoebel Holz Pflegekalender" (downloadable checklist).</Text>
        <Text style={styles.bullet}>- Asset C: "Balkon/Terrasse Material Guide 2026" (data visual + FAQ).</Text>
        <Text style={styles.bullet}>- Each asset must include author, update date, internal links, and schema.</Text>

        <Text style={styles.sectionTitle}>4) 12-Week Execution Plan</Text>
        {weekPlan.map((line) => (
          <Text key={line} style={styles.bullet}>
            - {line}
          </Text>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>5) Outreach Template (DE, short)</Text>
        <Text style={styles.bullet}>
          - Betreff: Datenbasierter Beitrag zu [Thema] fuer [Website]
        </Text>
        <Text style={styles.bullet}>
          - Hallo [Name], wir haben aktuelle Daten zu [Thema] im DE-Markt analysiert. Gerne stellen wir
          eine exklusive Kurzfassung inkl. Grafik fuer Ihren Artikel bereit. Falls passend, verlinken Sie
          bitte auf die Originalquelle.
        </Text>
      </Page>

      {prospectChunks.map((group, idx) => (
        <Page key={`prospects-${idx}`} size="A4" style={styles.page}>
          <Text style={styles.title}>Prospect Seed List (Germany) #{idx + 1}</Text>
          <Text style={styles.small}>
            Prioritaet A = first outreach wave; B = secondary; C = opportunistic/PR-only.
          </Text>

          <View style={[styles.row, { marginTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" }]}>
            <Text style={[styles.cNo, styles.th]}>#</Text>
            <Text style={[styles.cDomain, styles.th]}>Domain</Text>
            <Text style={[styles.cType, styles.th]}>Type</Text>
            <Text style={[styles.cPriority, styles.th]}>P</Text>
            <Text style={[styles.cAngle, styles.th]}>First angle</Text>
          </View>

          {group.map((p, i) => {
            const no = idx * 18 + i + 1;
            return (
              <View key={`${p.domain}-${no}`} style={styles.row}>
                <Text style={styles.cNo}>{no}</Text>
                <Text style={styles.cDomain}>{p.domain}</Text>
                <Text style={styles.cType}>{p.type}</Text>
                <Text style={styles.cPriority}>{p.priority}</Text>
                <Text style={styles.cAngle}>{p.angle}</Text>
              </View>
            );
          })}
        </Page>
      ))}

      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Operational Checklist</Text>
        <Text style={styles.sectionTitle}>Weekly QA</Text>
        <Text style={styles.bullet}>- Validate indexability of target pages before link acquisition.</Text>
        <Text style={styles.bullet}>- Review anchor ratio and avoid exact-match concentration spikes.</Text>
        <Text style={styles.bullet}>- Track link status: live / nofollow / sponsored / removed.</Text>
        <Text style={styles.bullet}>- Log outreach funnel: sent, replied, negotiated, published.</Text>

        <Text style={styles.sectionTitle}>Tracking Dashboard Fields</Text>
        <Text style={styles.bullet}>- Domain, URL, DR/AS, traffic estimate, topical fit, link type, anchor, status.</Text>
        <Text style={styles.bullet}>- Landing page, keyword cluster, date acquired, quality score (1-5).</Text>
        <Text style={styles.bullet}>- KPI tie-in: rankings, clicks, assisted conversions.</Text>

        <Text style={styles.sectionTitle}>Risk Controls</Text>
        <Text style={styles.bullet}>- If toxic links spike: investigate first, disavow only when necessary.</Text>
        <Text style={styles.bullet}>- Keep partner links relevant and limited; avoid sitewide manipulative links.</Text>
        <Text style={styles.bullet}>- Use transparent disclosure for paid collaboration.</Text>

        <Text style={[styles.small, { marginTop: 14 }]}>
          Note: Prospect list is a seed list for manual qualification before outreach. Verify editorial
          guidelines and contact availability per domain.
        </Text>
      </Page>
    </Document>
  );
};

async function main() {
  const outputPath =
    process.argv[2] ??
    "/Users/bao/seo-document/prestige-home-backlink-roadmap-de-2026-03-19.pdf";

  const directory = path.dirname(outputPath);
  await fs.promises.mkdir(directory, { recursive: true });

  const fileBuffer = await pdf(<BacklinkPlanDocument />).toBuffer();
  await fs.promises.writeFile(outputPath, fileBuffer);

  console.log(`PDF generated: ${outputPath}`);
  console.log(`Prospects included: ${prospects.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

