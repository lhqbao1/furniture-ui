import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { Metadata } from 'next'
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
        <HydrationBoundary state={dehydratedState}>
            <div className="w-full min-h-screen">
                {firstVersion ? (
                    <ListPolicy
                        versionId={firstVersion}
                        policyId="9fc87bb9-44d2-428d-9960-1b6074e11d76"
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
    )
}
