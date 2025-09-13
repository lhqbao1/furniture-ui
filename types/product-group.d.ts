import { ProductItem } from "./products"
import { VariantOptionsResponse } from "./variant"

export interface ProductGroupResponse {
    id: string
    name: string
    created_at: string
    updated_at: string
}



export interface ProductGroupDetailResponse {
    id: string
    name: string
    created_at: string
    updated_at: string
    variants: VariantOptionsResponse[]
    products: ProductItem[]
}