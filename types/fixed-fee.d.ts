export interface FixedFeeItem {
  type: string;
  month: number;
  year: number;
  quater: number;
  amount: number;
  from_date: string;
  to_date: string;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface FixedFeeResposne {
  total_fee: number;
  fixed_fees: FixedFeeItem[];
}
