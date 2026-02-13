import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromEbay, syncToEbay, syncToEbayInput } from "./api";
import { AxiosError } from "axios";
import { toast } from "sonner";

type SyncErrorResponse = EbaySyncErrorResponse | AuthError | GenericError;
type SyncToEbayInputWithMeta = syncToEbayInput & { __silent?: boolean };

export function useRemoveFormEbay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sku: string) => removeFromEbay(sku),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSyncToEbay() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<SyncErrorResponse>,
    SyncToEbayInputWithMeta,
    string | number
  >({
    mutationFn: (input: SyncToEbayInputWithMeta) => {
      const { __silent, ...payload } = input;
      return syncToEbay(payload as syncToEbayInput);
    },

    onMutate: (variables) => {
      if (variables.__silent) return;
      return toast.loading("Syncing data to Ebay...");
    },

    onSuccess: (_data, variables, toastId) => {
      if (variables.__silent) return;
      toast.success("Update data to eBay successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, variables, toastId) => {
      if (variables.__silent) return;
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
