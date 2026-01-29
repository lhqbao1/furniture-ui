import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryPoKeys } from "./inventory-po.keys";
import {
  createInventoryPo,
  deleteInventoryPo,
  getContainerInventory,
  getInventoryPoDetail,
  updateInventoryPo,
} from "./api";

export const useContainerInventory = (containerId?: string) => {
  return useQuery({
    queryKey: containerId ? inventoryPoKeys.container(containerId) : [],
    queryFn: () => getContainerInventory(containerId!),
    enabled: !!containerId,
  });
};

export const useInventoryPoDetail = (inventoryPoId?: string) => {
  return useQuery({
    queryKey: inventoryPoId ? inventoryPoKeys.detail(inventoryPoId) : [],
    queryFn: () => getInventoryPoDetail(inventoryPoId!),
    enabled: !!inventoryPoId,
  });
};

export const useCreateInventoryPo = (containerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventoryPo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventoryPoKeys.container(containerId),
      });
    },
  });
};

interface UpdateInventoryPoVariables {
  id: string;
  data: Parameters<typeof updateInventoryPo>[1];
}

export const useUpdateInventoryPo = (containerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateInventoryPoVariables) =>
      updateInventoryPo(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: inventoryPoKeys.container(containerId),
      });

      queryClient.invalidateQueries({
        queryKey: inventoryPoKeys.detail(id),
      });
    },
  });
};

export const useDeleteInventoryPo = (containerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInventoryPo,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventoryPoKeys.container(containerId),
      });
    },
  });
};
