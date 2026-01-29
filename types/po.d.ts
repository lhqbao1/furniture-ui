export type CustomerDetail = {
  id: string;
  name: string;
  tax_id?: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
  article_id?: number;
  contact_person: ContactPersonDetail;
  bank_info: BankInfoDetail;

  created_at: string;
  updated_at: string;
};

export type BankInfoDetail = {
  id: string;
  bank_name: string;
  account_no: string;
  account_name: string;
  currency: string;
  swift_code: string;
  customer_id: string;
  address: string;
  customer_id: string;

  created_at: string;
  updated_at: string;
};

export type ContactPersonDetail = {
  name: string;
  email: string;
  phone_number: string;
  customer_id: string;
  id: string;

  created_at: string;
  updated_at: string;
};

export type WareHouseDetail = {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  email: string;
  phone_number: string;
  id: string;

  created_at: string;
  updated_at: string;
};

export type PurchaseOrderDetail = {
  id: string;

  po_number: string;
  pi_number: string;
  customer_po_order: string;

  buyer: CustomerDetail;
  seller: CustomerDetail;
  warehouse: WareHouseDetail;

  created_by: string;

  loading_port: string;
  shipping_method: string;

  number_of_containers: number | null; // 👈 lưu ý: null

  payment_terms: string;
  delivery_conditions: string;
  type_of_bill_of_lading: string;
  destination: string;

  note: string;

  created_at: string; // ISO string
  updated_at: string; // ISO string
};

export type POContainerDetail = {
  id: string;

  container_number: string;
  purchase_order_id: string;

  size: string;

  date_of_inspection: string; // ISO string
  date_if_shipment: string; // ISO string
  date_of_issue: string; // ISO string

  created_at: string; // ISO string
  updated_at: string; // ISO string
};

export type POContainerInventoryProductDetail = {
  name: string;
  sku: string;
  id_provider: string;
  ean: string;
  image: string;
  id: string;
};

export type POContainerInventoryDetail = {
  id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  description: string;
  product: POContainerInventoryProductDetail;

  created_at: string; // ISO string
  updated_at: string; // ISO string
};
