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
import Script from "next/script";

// ✅ Metadata SEO
export const metadata = {
  title: "Liefer- und Versandbedingungen | Prestige Home",
  description:
    "Informationen zu Versand, Lieferung und Zustellbedingungen von Prestige Home. Erfahren Sie alles über Versandarten, Lieferzeiten und Kosten.",
  alternates: {
    canonical: "https://www.prestige-home.de/de/shipping-and-delivery",
  },
  openGraph: {
    title: "Liefer- und Versandbedingungen - Prestige Home",
    description:
      "Alle wichtigen Informationen zu Versand, Lieferung und Zustellung bei Prestige Home.",
    url: "https://www.prestige-home.de/de/shipping-and-delivery",
    siteName: "Prestige Home",
    locale: "de_DE",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Liefer- und Versandbedingungen | Prestige Home",
    description:
      "Versandinformationen und Lieferbedingungen von Prestige Home im Überblick.",
  },
};

export const revalidate = 3600; // ISR: regenerate mỗi 1h

export default async function ShippingPolicyPage() {
  const queryClient = new QueryClient();

  // Lấy phiên bản policy
  const version = await getPolicyVersion();
  const firstVersion = version.length > 0 ? version[0].id : null;

  // Prefetch version list
  await queryClient.prefetchQuery({
    queryKey: ["policy-version"],
    queryFn: () => getPolicyVersion(),
  });

  // Prefetch items nếu có version
  if (firstVersion) {
    await queryClient.prefetchQuery({
      queryKey: ["policy-items", firstVersion],
      queryFn: () => getPolicyItemsByVersion(firstVersion),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      {/* ✅ Schema.org structured data */}
      <Script
        id="schema-shipping-policy"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ShippingDeliveryTime",
            name: "Liefer- und Versandbedingungen",
            url: "https://www.prestige-home.de/de/shipping-and-delivery",
            transitTimeLabel: "Standardversand innerhalb Deutschlands",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "d",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 2,
              maxValue: 5,
              unitCode: "d",
            },
            deliveryMethod: "https://schema.org/DeliveryModeOwnFleet",
            areaServed: {
              "@type": "Country",
              name: "Deutschland",
            },
            inLanguage: "de",
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
              versionData={version}
              versionName={version[0].name}
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
