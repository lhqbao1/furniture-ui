export type User = {
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_supplier: boolean;
  is_admin: boolean;
  avatar_url: string;
  date_of_birth: string;
  language: string;
  gender: string;
  is_notified: boolean;
  company_name: string;
  tax_id: string;
  from_marketplace: string;
  is_real: boolean;
  created_at: string;
  updated_at: string;
};
export type LoginResponse = {
  id: string;
  access_token: string;
  token_type: string;
  email: string;
};

export type Customer = {
  id: string;
  user_code: string;
  email: string;
  phone_number: string;
  is_supplier: boolean;
  is_admin: boolean;
  first_name: string;
  last_name: string;
  is_active: boolean;
  company_name: string;
  avatar_url: string;
  date_of_birth: string;
  language: string;
  gender: string;
  from_marketplace: string;
  is_notified: boolean;
  tax_id: string;
  is_real: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};
