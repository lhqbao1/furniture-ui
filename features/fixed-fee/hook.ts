import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFixedFee,
  deleteFixedFee,
  getFixedFeeById,
  getFixedFeeWithTime,
  GetFixedFeeWithTimeParams,
  updateFixedFee,
} from "./api";
import { CreateFixedFeeValues } from "@/lib/schema/fixed-cost";
import { FixedFeeItem } from "@/types/fixed-fee";

export const useGetFixedFeeWithTime = (params: GetFixedFeeWithTimeParams) => {
  return useQuery({
    queryKey: ["fixed-fee-time", params],
    queryFn: () => getFixedFeeWithTime(params),
    enabled: Boolean(params.year),
  });
};

export const useCreateFixedFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFixedFeeValues) => createFixedFee(input),

    onSuccess: () => {
      // invalidate list / time-based query nếu có
      queryClient.invalidateQueries({
        queryKey: ["fixed-fee"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fixed-fee-time"],
      });
    },
  });
};

export const useGetFixedFeeById = (fixedFeeId?: string) => {
  return useQuery<FixedFeeItem>({
    queryKey: ["fixed-fee-detail", fixedFeeId],
    queryFn: () => getFixedFeeById(fixedFeeId!),
    enabled: Boolean(fixedFeeId),
  });
};

export const useUpdateFixedFee = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateFixedFeeValues }) =>
      updateFixedFee(id, input),
  });
};

export const useDeleteFixedFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFixedFee(id),
    onSuccess: () => {
      // invalidate list / time-based query nếu có
      queryClient.invalidateQueries({
        queryKey: ["fixed-fee"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fixed-fee-time"],
      });
    },
  });
};
