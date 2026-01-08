import { apiAdmin } from "@/lib/axios";
import { VariableFeeCreateValues } from "@/lib/schema/variable-cost";
import {
  GetVariableFeeByMarketplaceResponse,
  GetVariableFeeParams,
  VariableFeeItem,
} from "@/types/variable-fee";

/* CREATE */
export const createVariableFee = async (input: VariableFeeCreateValues) => {
  const { data } = await apiAdmin.post("/variable-fee", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VariableFeeItem;
};

/* UPDATE */
export const updateVariableFee = async (
  id: string,
  input: VariableFeeCreateValues,
) => {
  const { data } = await apiAdmin.put(`/variable-fee/${id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as VariableFeeItem;
};

/* DELETE */
export const deleteVariableFee = async (id: string) => {
  const { data } = await apiAdmin.delete(`/variable-fee/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
};

export const getVariableFeeByMarketplaceAndTime = async (
  params: GetVariableFeeParams,
) => {
  const { data } = await apiAdmin.get<GetVariableFeeByMarketplaceResponse>(
    "/variable-fee/time-and-marketplace",
    {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
};
