export interface VariableFeeItem {
  id: string;
  marketplace: string;
  type: string;
  month: number;
  year: number;
  quarter?: number;
  amount: number;
  from_date?: string;
  to_date?: string;
  created_at: string;
  updated_at: string;
}

export interface VariableCostItemUI {
  id?: string; // có thì là DB item
  marketplace: string;
  type: string;
  amount: number | "";
  originalAmount?: number | ""; // để diff
}

export interface VariableMarketplaceUI {
  marketplace: string;
  fees: VariableCostItemUI[];
}

export interface GetVariableFeeParams {
  year: number;
  month?: number;
  quarter?: number;
}

export interface VariableFeeTypeAmount {
  type: string;
  amount: number;
  ids: string[];
}

export interface VariableMarketplaceResponse {
  type: VariableFeeTypeAmount[];
  total: number;
}

export interface GetVariableFeeByMarketplaceResponse {
  [marketplace: string]: VariableMarketplaceResponse | number; // tổng cuối "total": 24237
}
