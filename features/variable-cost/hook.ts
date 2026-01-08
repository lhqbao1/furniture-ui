import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createVariableFee,
  updateVariableFee,
  deleteVariableFee,
  getVariableFeeByMarketplaceAndTime,
} from "./api";
import { VariableFeeCreateValues } from "@/lib/schema/variable-cost";
import { GetVariableFeeParams } from "@/types/variable-fee";

/* CREATE */
export const useCreateVariableFee = () =>
  useMutation({
    mutationFn: (input: VariableFeeCreateValues) => createVariableFee(input),
  });

/* UPDATE */
export const useUpdateVariableFee = () =>
  useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: VariableFeeCreateValues;
    }) => updateVariableFee(id, input),
  });

/* DELETE */
export const useDeleteVariableFee = () =>
  useMutation({
    mutationFn: (id: string) => deleteVariableFee(id),
  });

export const useGetVariableFeeByMarketplaceAndTime = (
  params: GetVariableFeeParams,
) => {
  return useQuery({
    queryKey: ["variable-fee-marketplace", params],
    queryFn: () => getVariableFeeByMarketplaceAndTime(params),
    enabled: Boolean(params.year),
  });
};
