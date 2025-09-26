import { useMutation } from "@tanstack/react-query";
import { removeFromEbay } from "./api";

export function useRemoveFormEbay() {
    return useMutation({
      mutationFn: (sku: string) => removeFromEbay(sku),
    });
  }