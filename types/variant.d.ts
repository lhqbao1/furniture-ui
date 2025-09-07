export interface VariantResponse {
    id: string
    name: string
    parent_id: string
    created_at: string
    updated_at: string
}

type VariantOptionResponse = {
  id?: string
  image_url?: string | null
  label: string
  created_at?: string
  updated_at?: string
}

type VariantOptionInput = {
  options: VariantOption[]
}

type VariantOption = {
  label: string
  image_url?: string | null
}

type ProductOptionData = {
  options: string[]
  product_id: string
}

type AddOptionToProductInput = {
  parent_id: string
  data: ProductOptionData[]
}

type VariantOption = {
  label: string
  image_url: string
  id: string
  created_at: string
  updated_at: string
}


type VariantOptionsResponse = {
  variant: VariantResponse
  options: VariantOptionResponse[]
}
