import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBankInfo,
  updateBankInfo,
  deleteBankInfo,
  getBankInfoDetail,
  getAllBankInfo,
  POBankInput,
} from "./api";
import { BankInfoDetail } from "@/types/po";

export function useGetAllBankInfo() {
  return useQuery<BankInfoDetail[]>({
    queryKey: ["bank-info", "all"],
    queryFn: getAllBankInfo,
  });
}

export function useGetBankInfoDetail(bankInfoId?: string) {
  return useQuery<BankInfoDetail>({
    queryKey: ["bank-info", "detail", bankInfoId],
    queryFn: () => getBankInfoDetail(bankInfoId!),
    enabled: !!bankInfoId, // 👈 guard tránh call khi undefined
  });
}

export function useCreateBankInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: POBankInput) => createBankInfo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-info", "all"] });
    },
  });
}

export function useUpdateBankInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bankInfoId,
      input,
    }: {
      bankInfoId: string;
      input: POBankInput;
    }) => updateBankInfo(bankInfoId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bank-info", "all"] });
      queryClient.invalidateQueries({
        queryKey: ["bank-info", "detail", variables.bankInfoId],
      });
    },
  });
}

export function useDeleteBankInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bankInfoId: string) => deleteBankInfo(bankInfoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-info", "all"] });
    },
  });
}
