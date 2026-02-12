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
  contact_persons: ContactPersonDetail[];
  bank_infos: BankInfoDetail[];

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
  date_of_delivery: string; // ISO string
  date_to_warehouse: string;

  is_sended_avis: boolean;
  avis_code?: string;

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
  list_delivery_date?: string;
  product: POContainerInventoryProductDetail;

  created_at: string; // ISO string
  updated_at: string; // ISO string
};

export type InventoryPOItem = {
  id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  description: string;
  list_delivery_date: string;
  product: {
    name: string;
    sku: string;
    id_provider: string;
    ean: string;
    static_files_po: {
      file_type: string;
      url: string;
      id: string;
      created_at: string;
      updated_at: string;
    };
    id: string;
  };
  created_at: string;
  updated_at: string;
  container: {
    container_number: string;
    purchase_order_id: string;
    size: string;
    date_of_inspection: string;
    date_if_shipment: string;
    date_of_delivery: string;
    date_of_issue: string;
    date_to_warehouse: string;
    is_sended_avis: boolean;
    purchase_order: {
      po_number: string;
      pi_number: string;
      created_by: string;
      loading_port: string;
      shipping_method: string;
      number_of_containers: number;
      buyer_id: string;
      seller_id: string;
      warehouse_id: string;
      customer_po_order: string;
      payment_terms: string;
      delivery_conditions: string;
      type_of_bill_of_lading: string;
      destination: string;
      note: string;
      hs_code: string;
    };
  };
};

export type ListInventoryPO = InventoryPOItem[];
