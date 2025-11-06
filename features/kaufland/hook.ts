import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { removeFromKaufland, syncToKaufland, syncToKauflandInput } from "./api";

export function useRemoveFormKaufland() {
    return useMutation({
      mutationFn: (offer_id: string) => removeFromKaufland(offer_id), 
    });
  }

  export function useSyncToKaufland() {
    const qc= useQueryClient()
    return useMutation<
      unknown, // 👈 kiểu dữ liệu thành công trả về (nếu biết rõ thì thay unknown)
      AxiosError<EbaySyncErrorResponse>, // 👈 kiểu error
      syncToKauflandInput // 👈 kiểu payload (biến truyền vào mutate)
    >({
      mutationFn: (input: syncToKauflandInput) => syncToKaufland(input),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['products'] })}
    })
  }