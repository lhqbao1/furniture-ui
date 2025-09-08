import { LucideIcon } from "lucide-react";
import { StaticFile } from "./products";
import { StaticFileResponse } from "@/features/file/api";
import { VariantOptionResponse } from "./variant";

export interface Category {
    id: number;
    name: string;
    icon: LucideIcon | string;
};

export interface HomeBannerItems {
    id: number;
    image: string;
    name: string
}

export interface CategoryResponse {
  id: string;
  name: string;
  img_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  code: string;
  level: number;
  parent_id: string | null;
  children: CategoryResponse[]; // đệ quy
  created_at: string; // hoặc Date nếu bạn parse
  updated_at: string; // hoặc Date nếu bạn parse
}

export interface CategoryInput {
  name: string;
  img_url?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  level: number;
  parent_id?: string; // optional
}


export interface ProductItem {
    name: string
    description: string
    price: number
    id_provider: string
    discount_percent: number
    discount_amount: number
    tax: string
    collection: string
    stock: number
    sku: string
    ean: string
    weight: number
    length: number
    width: number
    height: number
    is_active: boolean
    tag: string
    id: string
    final_price: number
    price_whithout_tax: number
    created_at: string
    updated_at: string
    static_files: StaticFile[]
    options: VariantOptionResponse[]
    categories: CategoryResponse[]
}

export interface CategoryByIdResponse {
    in_category: ProductItem[]
    not_in_category: ProductItem[]
}


export type AddOrRemoveProductToCategoryInput = {
  products: string[]
}
