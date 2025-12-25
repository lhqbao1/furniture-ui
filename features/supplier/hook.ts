import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  deleteSupplier,
  editSupplier,
  getSupplier,
  sendSupplierTracking,
  SendTrackingInput,
} from "./api";
import { SupplierInput } from "@/types/supplier";
interface SendTrackingVariables {
  checkoutId: string;
  payload: SendTrackingInput;
}
// --- GET ALL BRANDS ---
export function useGetSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSupplier(),
    retry: false,
  });
}

// --- CREATE BRAND ---
export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) => createSupplier(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

// --- EDIT BRAND ---
export function useEditSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SupplierInput }) =>
      editSupplier(input, id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

// --- DELETE BRAND ---
export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export const useSendSupplierTracking = () => {
  return useMutation({
    mutationFn: ({ checkoutId, payload }: SendTrackingVariables) =>
      sendSupplierTracking(checkoutId, payload),
  });
};
