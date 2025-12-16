import { BrandResponse } from "./brand";
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
  tag: Tag;
}

export interface Tag {
  name: string;
  color: string;
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
  status: string;
  results: StaticFileItem[];
};

export type StaticFileItem = {
  filename: string;
  url: string;
  status: string;
};

export type StaticFile = {
  file_type?: "image" | string;
  url: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type VariantOption = {
  label: string;
  image_url?: string;
  extra_price: number;
  stock: number;
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type Variant = {
  name: string;
  is_active: boolean;
  is_global: boolean;
  id?: string;
  created_at?: string;
  updated_at?: string;
  optionType?: string;
  options: VariantOption[];
};

export type ProductPackage = {
  weight: number;
  length: number;
  width: number;
  height: number;
};

export type Owner = {
  salutation: string;
  business_name: string;
  vat_id: string;
  email: string;
  email_order: string;
  email_billing: string;
  phone_number: string;
  id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export type ProductBundles = {
  bundle_item: ProductItem;
  quantity: number;
};

export type MarketplaceProduct = {
  marketplace: string;
  marketplace_offer_id?: string;
  name: string;
  description?: string;
  final_price: number;
  min_stock: number;
  max_stock: number;
  is_active: boolean;
  sku: string;
  brand: string;
  line_item_id: string;
  current_stock: number;
  manufacturer?: string;
  weight?: number;
  part_number?: string;
  is_fragile?: boolean;
  number_of_items?: number;
  included_components?: string;
  height?: number;
  width?: number;
  length?: number;
  depth?: number;
  asin?: string;
  model_number?: string;
  browse_node?: string;
  size?: string;
  country_of_origin?: string;
  handling_time?: number;
};

export type ProductPdfFiles = {
  title: string;
  url: string;
};

export interface InventoryItem {
  product_id: string;
  incoming_stock: number;
  date_received: string; // ISO datetime
  cost_received: number;
  total_cost: number;
  id: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export type ProductItem = {
  name: string;
  description: string;
  price: number;
  id_provider: string;
  cost: number;
  discount_percent?: number;
  discount_amount?: number;
  tax: string;
  collection?: string | null;
  stock: number;
  result_stock?: number;
  incomming_stock?: number;
  sku: string;
  ean: string;
  carrier: string;
  delivery_time: string;
  manufacture_country: string;
  tariff_number: string;
  ebay: boolean;
  unit: string;
  amount_unit: string;

  url_key: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  ebay_offer_id: string;

  weee_nr: string;
  eek: string;
  gpsr_info: string;
  technical_description: string;
  return_cost: number;
  pallet_unit: string;

  delivery_cost: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  is_active: boolean;
  tag?: string;
  id: string;
  final_price: number;
  price_whithout_tax: number;
  created_at?: string;
  updated_at?: string;
  parent_id?: string;
  static_files: StaticFile[];
  options: VariantOptionResponse[];
  categories: CategoryResponse[];
  brand: BrandResponse;

  delivery_multiple: boolean;
  return_cost: number;
  materials: string;
  color: string;
  number_of_packages: number;
  packages: ProductPackage[];
  owner: Owner;

  marketplace_products: MarketplaceProduct[];
  bundles: ProductBundles[];
  is_bundle: boolean;

  is_econelo: boolean;

  pdf_files: ProductPdfFiles[];
  is_fsc: boolean | null;
  note: string | null;

  inventory: InventoryItem[];
};

export type ProductResponse = {
  pagination: Pagination;
  items: ProductItem[];
};
