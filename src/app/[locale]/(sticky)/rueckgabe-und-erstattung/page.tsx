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
import { findPolicyByRouteKey } from "@/lib/policy-route";
import { notFound } from "next/navigation";
import Script from "next/script";

export const metadata = {
  title: "Rückgabe und Erstattung",
  description:
    "Informationen zu Rückgabe, Retoure und Erstattung bei Prestige Home.",
  alternates: {
    canonical: "https://www.prestige-home.de/de/rueckgabe-und-erstattung",
  },
  openGraph: {
    title: "Rückgabe und Erstattung - Prestige Home",
    description:
      "Alle Informationen zu Rückgabe, Retoure und Erstattung bei Prestige Home.",
    url: "https://www.prestige-home.de/de/rueckgabe-und-erstattung",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Rückgabe und Erstattung",
    description:
      "Informationen zu Rückgabe, Retoure und Erstattung bei Prestige Home.",
  },
};

export const revalidate = 3600; // ISR: regenerate mỗi 1h

export default async function ReturnRefundPolicyPage() {
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

  const returnRefundPolicy = findPolicyByRouteKey(
    items?.legal_policies ?? [],
    "returnRefund",
  );

  if (!returnRefundPolicy) {
    return notFound();
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Script
        id="schema-return-refund"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MerchantReturnPolicy",
            name: "Rückgabe und Erstattung",
            url: "https://www.prestige-home.de/de/rueckgabe-und-erstattung",
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
              initialPolicy={items}
              versionName={versions[0].name}
              activePolicyKey="returnRefund"
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
