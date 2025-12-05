import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { removeFromKaufland, syncToKaufland, syncToKauflandInput } from "./api";
import { toast } from "sonner";

type SyncErrorResponse = KauflandError | AuthError | GenericError;

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
    syncToKauflandInput,
    string | number
  >({
    mutationFn: (input) => syncToKaufland(input),

    onMutate: () => toast.loading("Syncing data to Kaufland..."),

    onSuccess: (_data, _vars, toastId) => {
      toast.success("Update data to Kaufland successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, _vars, toastId) => {
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
