  export interface FAQTopic {
    id: string
    name: string
    created_at: string
    updated_at: string
  }
  
  export interface FAQ {
  id: string
  topic_id: string
  question: string
  answer: string
  likes: number
  dislikes: number
  created_at: string // ISO date string
  updated_at: string // ISO date string
}
