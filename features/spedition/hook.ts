import { useMutation } from "@tanstack/react-query";
import {
  createSpeditionOutboundLabel,
  CreateSpeditionOutboundLabelPayload,
} from "@/features/spedition/api";

export function useCreateSpeditionOutboundLabel() {
  return useMutation({
    mutationFn: (payload: CreateSpeditionOutboundLabelPayload) =>
      createSpeditionOutboundLabel(payload),
  });
}
