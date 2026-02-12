import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryPoKeys } from "./inventory-po.keys";
import {
  createInventoryPo,
  deleteInventoryPo,
  getContainerInventory,
  getAllInventoryPo,
  getInventoryPoByProductId,
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

export const useAllInventoryPo = (search?: string) => {
  return useQuery({
    queryKey: [...inventoryPoKeys.all, "list", search ?? ""] as const,
    queryFn: () => getAllInventoryPo(search),
  });
};

export const useInventoryPoDetail = (inventoryPoId?: string) => {
  return useQuery({
    queryKey: inventoryPoId ? inventoryPoKeys.detail(inventoryPoId) : [],
    queryFn: () => getInventoryPoDetail(inventoryPoId!),
    enabled: !!inventoryPoId,
  });
};

export const useInventoryPoByProductId = (productId?: string) => {
  return useQuery({
    queryKey: productId ? inventoryPoKeys.detail(productId) : [],
    queryFn: () => getInventoryPoByProductId(productId!),
    enabled: !!productId,
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
