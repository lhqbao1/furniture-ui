import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { syncToAmazon, SyncToAmazonInput } from "./api";

type SyncErrorResponse = AmazonError | AuthError | GenericError;

export function useSyncToAmazon() {
  const qc = useQueryClient();

  return useMutation<
    any, // response data kiểu nào cũng nhận
    AxiosError<SyncErrorResponse>,
    SyncToAmazonInput,
    string | number
  >({
    mutationFn: (input) => syncToAmazon(input),

    onMutate: () => toast.loading("Syncing data to Amazon..."),

    onSuccess: (data, _vars, toastId) => {
      const status = data?.status;
      const issues = data?.issues ?? [];

      // 1) Tìm issues có severity = ERROR
      const errorIssue = issues.find(
        (i: any) => i.severity?.toUpperCase() === "ERROR",
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
