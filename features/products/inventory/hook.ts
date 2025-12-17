import { InventoryCreateValues } from "@/lib/schema/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInventory,
  deleteInventory,
  updateInventory,
  UpdateStockInput,
  updateStockProduct,
} from "./api";

export function useCreateInventory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: InventoryCreateValues) => createInventory(input),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useUpdateInventory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: InventoryCreateValues;
    }) => updateInventory(id, payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useUpdateStockProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: UpdateStockInput }) =>
      updateStockProduct(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteInventory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInventory(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
