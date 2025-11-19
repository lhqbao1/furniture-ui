import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromEbay, syncToEbay, syncToEbayInput } from "./api";
import { AxiosError } from "axios";
import { toast } from "sonner";

type SyncErrorResponse = EbaySyncErrorResponse | AuthError | GenericError;

export function useRemoveFormEbay() {
  return useMutation({
    mutationFn: (sku: string) => removeFromEbay(sku),
  });
}

export function useSyncToEbay() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<SyncErrorResponse>,
    syncToEbayInput,
    string | number
  >({
    mutationFn: (input: syncToEbayInput) => syncToEbay(input),

    onMutate: (variables) => {
      // show toast loading khi bắt đầu
      return toast.loading("Syncing data to Ebay...");
    },

    onSuccess: (data, variables, toastId) => {
      // cập nhật toast loading thành success
      toast.success("Update data to eBay successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, _vars, toastId) => {
      let message = "Update to Ebay failed";

      try {
        const data = error.response?.data as any;
        message =
          data?.detail?.errors?.[0]?.message ||
          data?.message ||
          data?.error ||
          error.message;
      } catch {
        message = error.message;
      }

      toast.error(message, { id: toastId });
    },
  });
}
