import { useMutation } from "@tanstack/react-query";
import { importWeAvis } from "@/features/amm/api";
import { ImportWeAvisPayload } from "@/lib/schema/amm-weavis";

export function useImportAmmProducts() {
  return useMutation({
    mutationFn: (payload: ImportWeAvisPayload) => importWeAvis(payload),
  });
}
