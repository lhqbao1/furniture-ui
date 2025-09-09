import { api } from "@/lib/axios"
import { FAQ, FAQTopic } from "@/types/faq"

export async function getFAQTopic() {
    const {data} = await api.get(
        '/topic',
    )
    return data as FAQTopic[]
}

export async function getFAQItem(topic_id: string) {
    const {data} = await api.get(
        `/faq/${topic_id}`,
    )
    return data as FAQ[]
  }