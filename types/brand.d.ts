export interface BrandResponse {
  name: string;
  img_url: string;
  id: string;
  company_phone: string;
  company_name: string;
  company_address: string;
  company_email: string;
  company_city: string;
  company_postal_code: string;
  company_country: string;
  code: number;
  created_at: string;
  updated_at: string;
}

export interface BrandInput {
  name: string;
  img_url?: string;
  company_name: string;
  company_phone?: string;
  company_address: string;
  company_email: string;
  company_city: string;
  company_postal_code: string;
  company_country: string;
}
