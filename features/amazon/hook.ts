import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { removeFromAmazon, syncToAmazon, SyncToAmazonInput } from "./api";

type SyncErrorResponse = AmazonError | AuthError | GenericError;
type SyncToAmazonInputWithMeta = SyncToAmazonInput & { __silent?: boolean };
type AmazonSyncIssue = {
  severity?: string;
  message?: string;
};
type AmazonSyncResponse = {
  status?: string;
  issues?: AmazonSyncIssue[];
};

export function useSyncToAmazon() {
  const qc = useQueryClient();

  return useMutation<
    AmazonSyncResponse,
    AxiosError<SyncErrorResponse>,
    SyncToAmazonInputWithMeta,
    string | number
  >({
    mutationFn: (input) => {
      const payload = { ...input } as SyncToAmazonInputWithMeta;
      delete payload.__silent;
      return syncToAmazon(payload as SyncToAmazonInput);
    },

    onMutate: (variables) => {
      if (variables.__silent) return;
      return toast.loading("Syncing data to Amazon...");
    },

    onSuccess: (data, vars, toastId) => {
      if (vars.__silent) return;
      const status = data?.status;
      const issues = data?.issues ?? [];

      // 1) Tìm issues có severity = ERROR
      const errorIssue = issues.find(
        (issue) => issue.severity?.toUpperCase() === "ERROR",
      );

      if (errorIssue) {
        toast.error(errorIssue.message, { id: toastId });
        return;
      }

      // 2) Nếu status không phải ACCEPTED → báo lỗi chung
      if (status !== "ACCEPTED") {
        toast.error(`Amazon returned status: ${status}`, { id: toastId });
        return;
      }

      // 3) Thành công
      toast.success("Update data to Amazon successfully", { id: toastId });
      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error, vars, toastId) => {
      if (vars.__silent) return;
      let message = "Update to Amazon failed";

      try {
        const data = error.response?.data as
          | {
              detail?: { errors?: Array<{ message?: string }> } | string;
              message?: string;
              error?: string;
            }
          | undefined;
        message =
          (typeof data?.detail === "object" && data?.detail?.errors?.[0]?.message) ||
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

export function useRemoveFromAmazon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sku: string) => removeFromAmazon(sku),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
