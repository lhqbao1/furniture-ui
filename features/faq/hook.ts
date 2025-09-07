import { useQuery } from "@tanstack/react-query";
import { getFAQItem, getFAQTopic } from "./api";

export function useGetFAQTopic(){
    return useQuery({
       queryKey: ["faq-topic"],
       queryFn: () => getFAQTopic(),
       retry: false,
     })
}

export function useGetFAQItem(topic_id: string) {
  return useQuery({
    queryKey: ["faq-item", topic_id],
    queryFn: () => getFAQItem(topic_id),
    enabled: !!topic_id,
    retry: false,
  })
}