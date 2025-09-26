import { useMutation } from "@tanstack/react-query";
import { removeFromEbay, syncToEbay, syncToEbayInput } from "./api";

export function useRemoveFormEbay() {
    return useMutation({
      mutationFn: (sku: string) => removeFromEbay(sku),
    });
  }

  export function useSyncToEbay() {
    return useMutation({
      mutationFn: (input: syncToEbayInput) => syncToEbay(input),
    });
  }