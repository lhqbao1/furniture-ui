import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { syncToAmazon, SyncToAmazonInput } from "./api";

type SyncErrorResponse = AmazonError | AuthError | GenericError;

// export function useRemoveFormKaufland() {
//     return useMutation({
//       mutationFn: (offer_id: string) => removeFromKaufland(offer_id),
//     });
//   }

export function useSyncToAmazon() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<SyncErrorResponse>,
    SyncToAmazonInput,
    string | number
  >({
    mutationFn: (input) => syncToAmazon(input),

    onMutate: () => toast.loading("Syncing data to Amazon..."),

    onSuccess: (_data, _vars, toastId) => {
      toast.success("Update data to Amazon successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, _vars, toastId) => {
      let message = "Update to Amazon failed";

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
