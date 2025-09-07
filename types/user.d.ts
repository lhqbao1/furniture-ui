export type User = {
    id: string
    email: string
    phone_number: string
    first_name?: string
    last_name?: string
    is_active: boolean
    avatar_url?: string | null
    date_of_birth?: string | null
    language?: string
    is_notified: boolean
    created_at?: string | null
    updated_at?: string | null
  }
  export type LoginResponse = {id: string, access_token: string, token_type: string, email: string}