import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import Script from 'next/script'

// ✅ Metadata SEO
export const metadata = {
    title: "Widerrufsbelehrung | Prestige Home",
    description: "Hier finden Sie die Widerrufsbelehrung (Rücktrittsrecht) von Prestige Home. Erfahren Sie, wie Sie Ihre Bestellung widerrufen können.",
    alternates: {
        canonical: "http://prestige-home.de/de/cancellation",
    },
    openGraph: {
        title: "Widerrufsbelehrung - Prestige Home",
        description: "Alles über Ihr Rücktrittsrecht bei Prestige Home. Informationen zum Widerruf von Bestellungen.",
        url: "https://www.prestige-home.de/cancellation",
        siteName: "Prestige Home",
        locale: "de_DE",
        type: "article",
    },
    twitter: {
        card: "summary",
        title: "Widerrufsbelehrung | Prestige Home",
        description: "Informationen zum Rücktrittsrecht und Widerruf Ihrer Bestellung bei Prestige Home.",
    },
}

export const revalidate = 3600 // ISR: regenerate mỗi 1h

export default async function WiderrufPage() {
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
            queryKey: ['policy-items', firstVersion], // đồng bộ key
            queryFn: () => getPolicyItemsByVersion(firstVersion),
        })
    }

    const dehydratedState = dehydrate(queryClient)

    return (
        <>
            <Script
                id="schema-cancellation"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MerchantReturnPolicy",
                        "name": "Widerrufsbelehrung – Rückgaberecht",
                        "url": "https://www.prestige-home.de/de/cancellation",
                        "applicableCountry": "DE",
                        "inLanguage": "de",
                        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                        "merchantReturnDays": 14,
                        "returnMethod": "https://schema.org/ReturnByMail",
                        "returnFees": "https://schema.org/FreeReturn",
                        "publisher": {
                            "@type": "Organization",
                            "name": "Prestige Home",
                            "url": "https://www.prestige-home.de"
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
