import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromEbay, syncToEbay, syncToEbayInput } from "./api";
import { AxiosError } from "axios";

export function useRemoveFormEbay() {
    return useMutation({
      mutationFn: (sku: string) => removeFromEbay(sku), 
    });
  }

  export function useSyncToEbay() {
    const qc= useQueryClient()
    return useMutation<
      unknown, // 👈 kiểu dữ liệu thành công trả về (nếu biết rõ thì thay unknown)
      AxiosError<EbaySyncErrorResponse>, // 👈 kiểu error
      syncToEbayInput // 👈 kiểu payload (biến truyền vào mutate)
    >({
      mutationFn: (input: syncToEbayInput) => syncToEbay(input),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['products'] })}
    })
  }