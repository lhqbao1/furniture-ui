import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import React from 'react'

export const revalidate = 3600 // ISR: regenerate mỗi 1h

export default async function Policy() {
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
            queryKey: ['policy-item', firstVersion],
            queryFn: () => getPolicyItemsByVersion(firstVersion),
        })
    }

    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <div className="w-full min-h-screen overflow-scroll">
                {firstVersion ? (
                    <ListPolicy versionId={firstVersion} />
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No policy found
                    </div>
                )}
            </div>
        </HydrationBoundary>
    )
}
