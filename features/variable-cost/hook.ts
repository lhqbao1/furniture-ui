import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVariableFee,
  updateVariableFee,
  deleteVariableFee,
  getVariableFeeByMarketplaceAndTime,
} from "./api";
import { VariableFeeCreateValues } from "@/lib/schema/variable-cost";
import { GetVariableFeeParams } from "@/types/variable-fee";

const invalidateAll = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ["checkout-dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["checkout-dashboard-products"] });
  queryClient.invalidateQueries({ queryKey: ["variable-fee-marketplace"] });
};

/* CREATE */
export const useCreateVariableFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VariableFeeCreateValues) => createVariableFee(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout-dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout-dashboard-products"],
      });
      queryClient.invalidateQueries({ queryKey: ["variable-fee-marketplace"] });
    },
  });
};

/* UPDATE */
export const useUpdateVariableFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: VariableFeeCreateValues;
    }) => updateVariableFee(id, input),
    onSuccess: () => {
      invalidateAll(queryClient);
    },
  });
};

/* DELETE */
export const useDeleteVariableFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVariableFee(id),
    onSuccess: () => {
      invalidateAll(queryClient);
    },
  });
};

export const useGetVariableFeeByMarketplaceAndTime = (
  params: GetVariableFeeParams,
) => {
  return useQuery({
    queryKey: ["variable-fee-marketplace", params],
    queryFn: () => getVariableFeeByMarketplaceAndTime(params),
    enabled: Boolean(params.year),
  });
};
