import ListFAQ from "@/components/layout/faq/list-faq";
import { getFAQItem, getFAQTopic } from "@/features/faq/api";
import type { Metadata } from "next";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";

// ISR: regenerate page mỗi 3600 giây
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Häufig gestellte Fragen zu Bestellung, Lieferung, Zahlung und Produkten bei Prestige Home.",
  alternates: {
    canonical: "https://www.prestige-home.de/de/faq",
  },
};

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
      <main className="w-full min-h-screen overflow-x-hidden bg-slate-50/40">
        {firstTopic ? (
          <ListFAQ topic_id={firstTopic} />
        ) : (
          <div className="px-4 py-24 text-center text-sm text-slate-500 md:text-base">
            Aktuell sind keine FAQ-Kategorien verfügbar.
          </div>
        )}
      </main>
    </HydrationBoundary>
  );
}
