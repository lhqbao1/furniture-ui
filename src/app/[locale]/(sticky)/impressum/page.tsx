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
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import React from "react";

export const revalidate = 3600; // ISR: regenerate mỗi 1h

// ✅ Metadata cho SEO + OpenGraph
export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Das Impressum von Prestige Home – Rechtliche Angaben, Kontaktdaten und gesetzliche Informationen gemäß deutscher Gesetzgebung.",
  alternates: {
    canonical: "http://prestige-home.de/de/impressum",
  },
  openGraph: {
    title: "Impressum",
    description:
      "Alle rechtlichen Informationen und Kontaktdaten von Prestige Home finden Sie hier.",
    url: "https://www.prestige-home.de/de/impressum",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "article",
  },
};

export default async function ImpressumPage() {
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
        id="schema-impressum"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Impressum – Prestige Home",
            url: "https://www.prestige-home.de/de/impressum",
            about: { "@type": "Thing", name: "Legal Notice / Impressum" },
            publisher: {
              "@type": "Organization",
              name: "Prestige Home",
              url: "https://www.prestige-home.de",
              logo: {
                "@type": "ImageObject",
                url: "https://www.prestige-home.de/images/logo.png",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+49 1520 6576540",
                contactType: "Customer Service",
                areaServed: "DE",
                availableLanguage: ["German", "English"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Greifswalder Straße 226",
                addressLocality: "Berlin",
                postalCode: "10405",
                addressCountry: "DE",
              },
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
