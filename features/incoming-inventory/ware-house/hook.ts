import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWarehouse,
  deleteWarehouse,
  POWarehouseInput,
  updateWarehouse,
} from "./api";

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: POWarehouseInput) => createWarehouse(input),
    onSuccess: () => {
      // nếu sau này có list warehouse
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: POWarehouseInput }) =>
      updateWarehouse(id, input),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["warehouse-detail", variables.id],
      });
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),

    onSuccess: (_, id) => {
      // refresh warehouse list
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });

      // remove detail cache nếu có
      queryClient.removeQueries({
        queryKey: ["warehouse-detail", id],
      });
    },
  });
};
