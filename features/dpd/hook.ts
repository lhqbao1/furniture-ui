import { useMutation } from "@tanstack/react-query";
import { createDpdOutboundLabels } from "@/features/dpd/api";
import type { CreateDpdOutboundLabelsPayload } from "@/features/dpd/api";

export function useCreateDpdOutboundLabels() {
  return useMutation({
    mutationFn: (payload: CreateDpdOutboundLabelsPayload) =>
      createDpdOutboundLabels(payload),
  });
}
