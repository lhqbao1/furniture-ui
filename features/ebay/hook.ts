import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromEbay, syncToEbay, syncToEbayInput } from "./api";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useRemoveFormEbay() {
    return useMutation({
      mutationFn: (sku: string) => removeFromEbay(sku), 
    });
  }

export function useSyncToEbay() {
  const qc = useQueryClient();

  return useMutation<
    unknown, // kiểu dữ liệu trả về khi success
    AxiosError<EbaySyncErrorResponse>, // custom error type
    syncToEbayInput, // payload truyền vào mutate
    string // context để truyền toastId
  >({
    mutationFn: (input) => syncToEbay(input),
    
    onMutate: (variables: syncToEbayInput) => {
      const toastId = toast.loading("Syncing data to eBay...") as string;
      return toastId;
    },

    onSuccess: (_data, _variables, toastId) => {
      // cập nhật toast loading thành success
      toast.success("Update data to eBay successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, _variables, toastId) => {
      // dùng custom error type để hiển thị thông tin lỗi chi tiết
      const message =
        error.response?.data?.detail.errors[0].message ||
        error.message ||
        "Update data to eBay failed";

      toast.error(message, { id: toastId });
    },
  });
}

