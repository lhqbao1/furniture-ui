import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import React from 'react'

export const revalidate = 3600

export default async function AGBPage() {
    const queryClient = new QueryClient()

    // Lấy phiên bản policy
    const version = await getPolicyVersion()
    const firstVersion = version.length > 0 ? version[0].id : null
    const versionDetails = await getPolicyItemsByVersion(firstVersion ?? '')
    // Prefetch version list
    await queryClient.prefetchQuery({
        queryKey: ['policy-version'],
        queryFn: () => getPolicyVersion(),
    })

    // Prefetch items nếu có version
    if (firstVersion) {
        await queryClient.prefetchQuery({
            queryKey: ['policy-item', firstVersion],
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
