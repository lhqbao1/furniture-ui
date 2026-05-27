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
