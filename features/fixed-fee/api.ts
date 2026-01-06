import { apiAdmin } from "@/lib/axios";
import { CreateFixedFeeValues } from "@/lib/schema/fixed-cost";
import { FixedFeeItem, FixedFeeResposne } from "@/types/fixed-fee";

export interface GetFixedFeeWithTimeParams {
  year: number; // required
  month?: number; // optional (1–12)
  quater?: number; // optional (1–4) ⚠️ theo backend
}

export const createFixedFee = async (input: CreateFixedFeeValues) => {
  const { data } = await apiAdmin.post("/fixed-fee", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });
  return data;
};

export const updateFixedFee = async (
  fixed_fee_id: string,
  input: CreateFixedFeeValues,
) => {
  const { data } = await apiAdmin.put(`/fixed-fee/${fixed_fee_id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });
  return data;
};

export const deleteFixedFee = async (fixed_fee_id: string) => {
  const { data } = await apiAdmin.delete(`/fixed-fee/${fixed_fee_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });
  return data;
};

export const getFixedFeeById = async (fixed_fee_id: string) => {
  const { data } = await apiAdmin.get(`/fixed-fee/detail/${fixed_fee_id}`);
  return data as FixedFeeItem;
};

export const getFixedFeeWithTime = async (
  params: GetFixedFeeWithTimeParams,
) => {
  const { data } = await apiAdmin.get("/fixed-fee/time", {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as FixedFeeResposne;
};
