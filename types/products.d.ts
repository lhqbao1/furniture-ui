import { CategoryResponse } from "./categories";
import { Pagination } from "./pagination";
import { VariantOptionResponse } from "./variant";

export interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    category: string;
    rating: number;
    salePrice: number;
    tag: Tag
}

export interface Tag {
    name: string;
    color: string
}

export interface PreOrderProduct {
    id: number;
    name: string;
    award?: string;
    image: string;
    price: number;
    category: string;
    color: string[];
    desc: string;
}

export type StaticFileResponse = {
  status: string
  results: StaticFileItem[]
}

export type StaticFileItem = {
  filename: string
  url: string
  status: string
}

export type StaticFile = {
    file_type?: "image" | string
    url: string
    id?: string
    created_at?: string
    updated_at?: string
  }
  
  export type VariantOption = {
    label: string
    image_url?: string
    extra_price: number
    stock: number
    id?: string
    created_at?: string
    updated_at?: string
  }
  
  export type Variant = {
    name: string
    is_active: boolean
    is_global: boolean
    id?: string
    created_at?: string
    updated_at?: string
    optionType?: string
    options: VariantOption[]
  }

  export type ProductItem = {
    name: string
    description: string
    price: number
    discount_percent?: number
    discount_amount?: number
    tax: string
    category?: string
    collection?: string | null
    stock: number
    sku: string
    barcode: string
    weight: number
    length: number
    width: number
    height: number
    is_active: boolean
    tag?: string
    id?: string
    final_price: number
    created_at?: string
    updated_at?: string
    static_files: StaticFile[]
    variants: Variant[]
  }

    export type NewProductItem = {
    name: string
    description: string
    price: number
    id_provider: string
    cost: number
    discount_percent?: number
    discount_amount?: number
    tax: string
    collection?: string | null
    stock: number
    sku: string
    ean: string
    weight: number
    length: number
    width: number
    height: number
    is_active: boolean
    tag?: string
    id?: string
    final_price: number
    price_whithout_tax?: number
    created_at?: string
    updated_at?: string
    parent_id?: string
    static_files: StaticFile[]
    options: VariantOptionResponse[]
    categories: CategoryResponse[]
  }
  
  export type ProductResponse = {
    pagination: Pagination
    items: NewProductItem[]
  }
  