export interface BrandResponse {
    name: string
    img_url: string
    id: string
    company_name: string
    company_address: string
    company_email: string
    created_at: string
    updated_at: string
}

export interface BrandInput {
    name: string
    img_url: string
    company_name: string
    company_address: string
    company_email: string
}