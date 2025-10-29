import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'

export const revalidate = 3600 // ISR: regenerate mỗi 1h

// ✅ Metadata cho SEO + OpenGraph
export const metadata: Metadata = {
    title: "Impressum | Prestige Home",
    description:
        "Das Impressum von Prestige Home – Rechtliche Angaben, Kontaktdaten und gesetzliche Informationen gemäß deutscher Gesetzgebung.",
    alternates: {
        canonical: "http://prestige-home.de/de/impressum",
    },
    openGraph: {
        title: "Impressum | Prestige Home",
        description:
            "Alle rechtlichen Informationen und Kontaktdaten von Prestige Home finden Sie hier.",
        url: "https://www.prestige-home.de/de/impressum",
        siteName: "Prestige Home",
        locale: "de_DE",
        type: "article",
    },
}


export default async function ImpressumPage() {
    const queryClient = new QueryClient()

    // Lấy phiên bản policy
    const version = await getPolicyVersion()
    const firstVersion = version.length > 0 ? version[0].id : null

    // Prefetch version list
    await queryClient.prefetchQuery({
        queryKey: ['policy-version'],
        queryFn: () => getPolicyVersion(),
    })

    // Prefetch items nếu có version
    if (firstVersion) {
        await queryClient.prefetchQuery({
            queryKey: ['policy-items', firstVersion], // ✅ đồng bộ với ListPolicy
            queryFn: () => getPolicyItemsByVersion(firstVersion),
        })
    }

    const dehydratedState = dehydrate(queryClient)

    return (
        <>
            <Script
                id="schema-impressum"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Impressum – Prestige Home",
                        "url": "https://www.prestige-home.de/de/impressum",
                        "about": { "@type": "Thing", "name": "Legal Notice / Impressum" },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Prestige Home",
                            "url": "https://www.prestige-home.de",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.prestige-home.de/images/logo.png"
                            },
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "telephone": "+49 1520 6576540",
                                "contactType": "Customer Service",
                                "areaServed": "DE",
                                "availableLanguage": ["German", "English"]
                            },
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Greifswalder Straße 226",
                                "addressLocality": "Berlin",
                                "postalCode": "10405",
                                "addressCountry": "DE"
                            }
                        }
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
    )
}
