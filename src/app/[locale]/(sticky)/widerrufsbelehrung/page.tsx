import ListPolicy from "@/components/layout/policy/list-policy";
import {
  getPolicyItemsByVersion,
  getPolicyVersion,
} from "@/features/policy/api";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { notFound } from "next/navigation";
import Script from "next/script";

// ✅ Metadata SEO
export const metadata = {
  title: "Widerrufsbelehrung",
  description:
    "Hier finden Sie die Widerrufsbelehrung (Rücktrittsrecht) von Prestige Home. Erfahren Sie, wie Sie Ihre Bestellung widerrufen können.",
  alternates: {
    canonical: "http://prestige-home.de/de/widerrufsbelehrung",
  },
  openGraph: {
    title: "Widerrufsbelehrung - Prestige Home",
    description:
      "Alles über Ihr Rücktrittsrecht bei Prestige Home. Informationen zum Widerruf von Bestellungen.",
    url: "https://www.prestige-home.de/widerrufsbelehrung",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Widerrufsbelehrung",
    description:
      "Informationen zum Rücktrittsrecht und Widerruf Ihrer Bestellung bei Prestige Home.",
  },
};

export const revalidate = 3600; // ISR: regenerate mỗi 1h

export default async function WiderrufPage() {
  const queryClient = new QueryClient();

  const versions = await getPolicyVersion();
  queryClient.setQueryData(["policy-version"], versions);

  const firstVersion = versions?.[0]?.id;

  if (!firstVersion) {
    // không có version → skip hết, tránh API thừa
    return notFound();
  }

  const items = await getPolicyItemsByVersion(firstVersion);
  queryClient.setQueryData(["policy-items", firstVersion], items);

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Script
        id="schema-cancellation"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MerchantReturnPolicy",
            name: "Widerrufsbelehrung – Rückgaberecht",
            url: "https://www.prestige-home.de/de/widerrufsbelehrung",
            applicableCountry: "DE",
            inLanguage: "de",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            publisher: {
              "@type": "Organization",
              name: "Prestige Home",
              url: "https://www.prestige-home.de",
            },
          }),
        }}
      />

      <HydrationBoundary state={dehydratedState}>
        <div className="w-full min-h-screen">
          {firstVersion ? (
            <ListPolicy
              versionId={firstVersion}
              versionData={versions}
              versionName={versions[0].name}
            />
          ) : (
            <div className="text-center py-20 text-gray-500">
              Keine Richtlinie gefunden
            </div>
          )}
        </div>
      </HydrationBoundary>
    </>
  );
}
