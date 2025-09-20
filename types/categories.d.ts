import { LucideIcon } from "lucide-react";
import { ProductItem, StaticFile } from "./products";
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
  slug: string;
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
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  level: number;
  parent_id?: string; // optional
}

export interface CategoryByIdResponse {
    in_category: ProductItem[]
    not_in_category: ProductItem[]
}

export interface CategoryBySlugResponse {
  products: ProductItem[]
  page: number
  total_pages: number
  total_items: number
  page_size: number
}


export type AddOrRemoveProductToCategoryInput = {
  products: string[]
}
