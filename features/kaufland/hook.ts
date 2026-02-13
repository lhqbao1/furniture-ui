import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { removeFromKaufland, syncToKaufland, syncToKauflandInput } from "./api";
import { toast } from "sonner";

type SyncErrorResponse = KauflandError | AuthError | GenericError;
type SyncToKauflandInputWithMeta = syncToKauflandInput & { __silent?: boolean };

export function useRemoveFormKaufland() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offer_id: string) => removeFromKaufland(offer_id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
export function useSyncToKaufland() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<SyncErrorResponse>,
    SyncToKauflandInputWithMeta,
    string | number
  >({
    mutationFn: (input) => {
      const { __silent, ...payload } = input;
      return syncToKaufland(payload as syncToKauflandInput);
    },

    onMutate: (variables) => {
      if (variables.__silent) return;
      return toast.loading("Syncing data to Kaufland...");
    },

    onSuccess: (_data, variables, toastId) => {
      if (variables.__silent) return;
      toast.success("Update data to Kaufland successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, variables, toastId) => {
      if (variables.__silent) return;
      let message = "Update to Kaufland failed";

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
