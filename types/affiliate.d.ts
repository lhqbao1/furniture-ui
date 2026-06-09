export interface AffiliateCreateInput {
  name: string;
  code: string;
  weight: number;
  commission_rate: number;
}

export interface AffiliateUpdateInput {
  name: string;
  code: string;
  weight: number;
  commission_rate: number;
}

export interface AffiliateResponse {
  name: string;
  code: string;
  weight: number;
  commission_rate: number;
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface AffiliateOwnerResponse {
  id: string;
  user_code: string;
  is_supplier: boolean;
  is_admin: boolean;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
  avatar_url: string | null;
  date_of_birth: string | null;
  language: string;
  gender: string | null;
  tax_id: string | null;
  company_name: string | null;
  from_marketplace: string | null;
  is_notified: boolean;
  is_real: boolean;
  is_affiliate: boolean;
  created_at: string;
  updated_at: string;
}
