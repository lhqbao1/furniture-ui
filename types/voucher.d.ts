export interface VoucherItem {
  code: string;
  name: string;
  type: string;
  discount_type: string;
  discount_value: number;
  max_discount: number;
  min_order_value: number;
  start_at: string; // ISO date
  end_at: string; // ISO date
  total_usage_limit: number;
  user_usage_limit: number;
  is_active: boolean;
  carrier: string[];

  id: string;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export type VoucherResponse = VoucherItem[];

export interface VoucherProductItem {
  voucher_id: string;
  product_id: string;
  id: string;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export type VoucherProductResponse = VoucherProductItem[];

export interface VoucherCategoryItem {
  voucher_id: string;
  category_id: string;
  id: string;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export type VoucherCategoryResponse = VoucherCategoryItem[];

export interface VoucherShippingItem {
  voucher_id: string;
  max_shipping_discount: number;
  shipping_method: string;
  id: string;
  created_at: string;
  updated_at: string;
}
