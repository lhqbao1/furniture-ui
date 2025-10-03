export type User = {
    id: string
    email: string
    phone_number: string
    first_name: string
    last_name: string
    is_active: boolean
    avatar_url: string
    date_of_birth: string 
    language: string
    gender: string
    is_notified: boolean
    created_at: string 
    updated_at: string
  }
  export type LoginResponse = {id: string, access_token: string, token_type: string, email: string}

  export type Customer = {
    id: string
    user_code: string
    email: string
    phone_number: string
    first_name: string
    last_name: string
    is_active: boolean
    avatar_url: string
    date_of_birth: string
    language: string
    gender: string
    is_notified: boolean
    created_at: string // ISO date string
    updated_at: string // ISO date string
  }
  