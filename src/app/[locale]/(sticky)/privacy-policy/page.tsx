import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'

export const revalidate = 3600 // ISR: regenerate mỗi 1h

export const metadata: Metadata = {
    title: "Datenschutzerklärung | Prestige Home",
    description:
        "Lesen Sie die Datenschutzerklärung von Prestige Home – Informationen zum Datenschutz, zur Verarbeitung personenbezogener Daten und zu Ihren Rechten.",
    alternates: {
        canonical: "http://prestige-home.de/de/privacy-policy",
    },
    openGraph: {
        title: "Datenschutzerklärung | Prestige Home",
        description:
            "Transparenz über Datenschutz und Ihre Rechte bei Prestige Home.",
        url: "https://www.prestige-home.de/privacy-policy",
        siteName: "Prestige Home",
        locale: "de_DE",
        type: "article",
    },
}

export default async function DatenschutzerklarungPage() {
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
            queryKey: ['policy-items', firstVersion], // giữ đồng bộ với ListPolicy
            queryFn: () => getPolicyItemsByVersion(firstVersion),
        })
    }

    const dehydratedState = dehydrate(queryClient)

    return (
        <>
            <Script
                id="schema-privacy"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        "name": "Datenschutzerklärung – Prestige Home",
                        "url": "https://www.prestige-home.de/de/privacy-policy",
                        "about": { "@type": "Thing", "name": "Privacy Policy / Data Protection" },
                        "inLanguage": "de",
                        "publisher": {
                            "@type": "Organization",
                            "name": "Prestige Home",
                            "url": "https://www.prestige-home.de",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/5c38c322-bafc-4e6f-8d14-0c1ba4b7b8de_invoice-logo.png"
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
