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
