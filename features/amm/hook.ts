import { useMutation } from "@tanstack/react-query";
import { importProductToAmm, importWeAvis } from "@/features/amm/api";
import { ImportWeAvisPayload } from "@/lib/schema/amm-weavis";

export function useImportAmmProducts() {
  return useMutation({
    mutationFn: (payload: ImportWeAvisPayload) => importWeAvis(payload),
  });
}

export function useImportProductToAmm() {
  return useMutation({
    mutationFn: (ids: string[]) => importProductToAmm(ids),
  });
}
