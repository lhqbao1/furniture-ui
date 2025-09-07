import ListFAQ from '@/components/layout/faq/list-faq'
import { getFAQItem, getFAQTopic } from '@/features/faq/api'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import React from 'react'

// ISR: regenerate page mỗi 3600 giây
export const revalidate = 3600

export default async function FAQ() {
    const queryClient = new QueryClient()

    // gọi API server-side
    const topic = await getFAQTopic()
    const firstTopic = topic[topic.length - 1].id

    // prefetch để cache cho React Query
    await queryClient.prefetchQuery({
        queryKey: ['faq-topic'],
        queryFn: () => getFAQTopic(),
    })

    await queryClient.prefetchQuery({
        queryKey: ['faq-item', firstTopic],
        queryFn: () => getFAQItem(firstTopic),
    })

    // convert cache sang dehydrated state
    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <div className="w-full min-h-screen overflow-scroll">
                <ListFAQ topic_id={firstTopic} />
            </div>
        </HydrationBoundary>
    )
}
