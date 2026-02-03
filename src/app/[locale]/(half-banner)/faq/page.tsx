import ListFAQ from "@/components/layout/faq/list-faq";
import { getFAQItem, getFAQTopic } from "@/features/faq/api";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";

// ISR: regenerate page mỗi 3600 giây
export const revalidate = 3600;

export default async function FAQ() {
  const queryClient = new QueryClient();

  // Gọi API server-side
  const topic = await getFAQTopic();

  // Kiểm tra topic có tồn tại hay không
  const firstTopic = topic.length > 0 ? topic[0].id : null;

  // Prefetch topic list
  await queryClient.prefetchQuery({
    queryKey: ["faq-topic"],
    queryFn: () => getFAQTopic(),
  });

  // Prefetch FAQ items nếu có topic
  if (firstTopic) {
    await queryClient.prefetchQuery({
      queryKey: ["faq-item", firstTopic],
      queryFn: () => getFAQItem(firstTopic),
    });
  }

  // Convert cache sang dehydrated state
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="w-full min-h-screen overflow-scroll">
        {firstTopic ? (
          <ListFAQ topic_id={firstTopic} />
        ) : (
          <div className="text-center py-20 text-gray-500">
            No FAQ topics available
          </div>
        )}
      </div>
    </HydrationBoundary>
  );
}
