import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { Metadata } from 'next'
import React from 'react'

export const revalidate = 3600

// ✅ Metadata SEO của Next.js
export const metadata: Metadata = {
    title: "Allgemeine Geschäftsbedingungen (AGB) | Prestige Home",
    description: "Hier finden Sie die allgemeinen Geschäftsbedingungen (AGB) von Prestige Home. Transparente Regeln und faire Konditionen.",
    alternates: {
        canonical: "/agb",
    },
    openGraph: {
        title: "AGB - Prestige Home",
        description: "Unsere Allgemeinen Geschäftsbedingungen (AGB) im Überblick.",
        url: "https://www.prestige-home.de/agb",
        siteName: "Prestige Home",
        locale: "de_DE",
        type: "article",
    },
}

export default async function AGBPage() {
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
            queryKey: ['policy-items', firstVersion],
            queryFn: () => getPolicyItemsByVersion(firstVersion),
        })
    }

    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <div className="w-full min-h-screen">
                {firstVersion ? (
                    <ListPolicy versionId={firstVersion} versionData={version} versionName={version[0].name} />
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        Keine Richtlinie gefunden
                    </div>
                )}
            </div>
        </HydrationBoundary>
    )
}
