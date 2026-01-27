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
