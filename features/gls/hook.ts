import { useMutation } from "@tanstack/react-query";
import { createGlsOutboundLabels } from "@/features/gls/api";
import type { CreateGlsOutboundLabelsPayload } from "@/features/gls/api";

export function useCreateGlsOutboundLabels() {
  return useMutation({
    mutationFn: (payload: CreateGlsOutboundLabelsPayload) =>
      createGlsOutboundLabels(payload),
  });
}
