import { Address } from "./address";
import { CartItem, CartResponse, CartResponseItem } from "./cart";
import { Pagination } from "./pagination";
import { StaticFile, StaticFileResponse } from "./products";
import { SupplierResponse } from "./supplier";
import { Customer, User } from "./user";

interface CheckOutResponse {
  items: CheckOut[];
  pagination: Pagination;
}

export interface CheckOutShipmentProductReturn {
  sku: string;
  quantity: number;
  name: string;
  type: string;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CheckOutShipment {
  checkout_id: string;
  checkout_marketplace_id: string;
  status: string;
  id: string;
  ship_code: string;
  created_at: string;
  updated_at: string;
  tracking_number: string;
  shipper_date: string;
  shipping_carrier: string;
  product_returns?:
    | CheckOutShipmentProductReturn
    | CheckOutShipmentProductReturn[]
    | null;
}

interface CartResponseCheckOut {
  user_id: string;
  supplier_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}
interface CheckOut {
  id: string;
  user: Customer;
  checkout_code: string;
  shipping_address: Address;
  invoice_address: Address;
  cart: CartResponseItem;
  status: string;
  note: string;
  coupon_amount: number;
  voucher_amount: number;
  total_amount_item: number;
  total_vat: number;
  payment_method: string;
  total_shipping: number;
  from_marketplace: string;
  marketplace_order_id: string;
  delivery_from?: string | null;
  delivery_to?: string | null;
  total_amount: number;
  supplier: SupplierResponse;
  carrier: string;
  shipment: CheckOutShipment;
  created_at: Date;
  updated_at: Date;
}

export interface CheckOutPaymentRl {
  capture_id?: string;
}

export interface CheckoutMainProductRefundFile {
  url: string;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutMainProductRefundItem {
  name: string;
  sku: string;
  quantity: number;
  id_provider: string;
  unit_price: number;
  refund_amount: number;
  reason: string;
  type: string;
  files: CheckoutMainProductRefundFile[];
}

export interface CheckOutMain {
  id: string;
  checkout_code: string;
  invoice_pdf_file?: string | null;
  invoice_pdf_file_2?: string | null;
  status: string;
  note: string;
  total_amount_item: number;
  total_shipping: number;
  total_vat: number;
  total_amount: number;
  coupon_amount: number;
  voucher_amount: number;
  from_marketplace: string;
  marketplace_order_id: string;
  delivery_from?: string | null;
  delivery_to?: string | null;
  payment_method: string;
  checkouts: CheckOut[];
  tax: number;
  is_claimed_factory?: boolean;
  is_claimed_marketplace?: boolean;
  payment_rl: CheckOutPaymentRl;
  files: StaticFile[];
  refund_amount: number;
  product_refund?: CheckoutMainProductRefundItem[];
  created_at: Date;
  updated_at: Date;
}
interface CheckOutMainResponse {
  items: CheckOutMain[];
  pagination: Pagination;
}

export interface RefundOrderFile {
  url: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RefundOrderProduct {
  name: string;
  sku: string;
  quantity: number;
  id_provider?: string;
  unit_price: number;
  refund_amount: number;
  reason: string;
  type: string;
  files?: RefundOrderFile[];
}

export interface RefundOrderItem extends CheckOutMain {
  reason?: string;
  product_refund?: RefundOrderProduct[];
}

export interface RefundOrdersResponse {
  items: RefundOrderItem[];
  pagination: Pagination;
}

export interface CheckOutStatistics {
  count_order: number;
  total_order: number;

  count_waiting_payment_order: number;
  total_waiting_payment_order: number;

  count_payment_received_order: number;
  total_payment_received_order: number;

  count_preparing_shipping_order: number;
  total_preparing_shipping_order: number;

  count_dispatched_order: number;
  total_dispatched_order: number;

  count_cancel_order: number;
  total_cancel_order: number;

  count_return_order: number;
  total_return_order: number;

  count_stock_reserved_order: number;
  total_stock_reserved_order: number;
}

export interface MarketplaceOverviewItem {
  marketplace: string;
  total_orders: number;
  total_amount: number;
  percentage: number; // % trên grand total
}

export interface CheckoutDashboardResponse {
  from_date: string | null;
  to_date: string | null;
  grand_total_amount: number;
  grand_total_orders: number;
  data: MarketplaceOverviewItem[];
}

export interface QuantityAmount {
  total_quantity: number;
  total_amount: number;
}

export interface ProviderItem {
  id_provider: string;
  product_name?: string;
  static_files?: Array<{
    id?: string;
    url?: string;
  }>;

  total_quantity: number;
  total_amount: number;

  by_marketplace: Record<string, QuantityAmount>;
  by_status: Record<string, QuantityAmount>;

  cost: number;
  delivery_cost: number;
  total_cost: number;
  total_profit: number;
  product_margin: number;
}

export interface ProviderSummary {
  total_id_provider: number;
  total_quantity: number;
  total_amount: number;
  total_cost: number;
}

export interface ProviderOverviewResponse {
  summary: ProviderSummary;
  items: ProviderItem[];
}
