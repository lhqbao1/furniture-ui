import ListPolicy from "@/components/layout/policy/list-policy";
import {
  getPolicyItemsByVersion,
  getPolicyVersion,
} from "@/features/policy/api";
import { PolicyResponse } from "@/types/policy";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import React from "react";

export const revalidate = 3600;

// ✅ Metadata SEO của Next.js
export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen (AGB)",
  description:
    "Hier finden Sie die allgemeinen Geschäftsbedingungen (AGB) von Prestige Home. Transparente Regeln und faire Konditionen.",
  alternates: {
    canonical: "http://prestige-home.de/de/agb",
  },
  openGraph: {
    title: "AGB - Prestige Home",
    description: "Unsere Allgemeinen Geschäftsbedingungen (AGB) im Überblick.",
    url: "https://www.prestige-home.de/agb",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "article",
  },
};

export default async function AGBPage() {
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
        id="schema-agb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Allgemeine Geschäftsbedingungen (AGB)",
            url: "https://www.prestige-home.de/de/agb",
            about: { "@type": "Thing", name: "Terms and Conditions" },
            inLanguage: "de",
            publisher: {
              "@type": "Organization",
              name: "Prestige Home",
              url: "https://www.prestige-home.de",
              logo: {
                "@type": "ImageObject",
                url: "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/5c38c322-bafc-4e6f-8d14-0c1ba4b7b8de_invoice-logo.png",
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
