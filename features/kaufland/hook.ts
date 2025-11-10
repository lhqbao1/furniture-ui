import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { removeFromKaufland, syncToKaufland, syncToKauflandInput } from "./api";
import { toast } from "sonner";

export function useRemoveFormKaufland() {
    return useMutation({
      mutationFn: (offer_id: string) => removeFromKaufland(offer_id), 
    });
  }
export function useSyncToKaufland() {
  const qc = useQueryClient();

  return useMutation<
    unknown, // dữ liệu thành công trả về
    AxiosError<EbaySyncErrorResponse>, // custom error type
    syncToKauflandInput, // payload
    string | number // context để truyền toastId
  >({
    mutationFn: (input) => syncToKaufland(input),

    onMutate: (variables) => {
      // show toast loading khi bắt đầu
      return toast.loading("Syncing data to Kaufland...");
    },

    onSuccess: (_data, _variables, toastId) => {
      toast.success("Update data to Kaufland successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, _variables, toastId) => {
      const message =
        error.response?.data?.detail.errors[0].message || error.message || "Update to Kaufland failed";
      toast.error(message, { id: toastId });
    },
  });
}