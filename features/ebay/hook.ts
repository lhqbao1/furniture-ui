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

  return useMutation({
    mutationFn: (input: syncToEbayInput) => syncToEbay(input),
    
    // onMutate: (variables) => {
    //   // show toast loading khi bắt đầu
    //   return toast.loading("Syncing data to Ebay...");
    // },

    onSuccess: () => {
      // cập nhật toast loading thành success
      toast.success("Update data to eBay successfully");
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error) => {
      // dùng custom error type để hiển thị thông tin lỗi chi tiết
      const message =
        // error.response?.data?.detail.errors[0].message ||
        // error.message ||
        "Update data to eBay failed";

      toast.error(message);
    },
  });
}


