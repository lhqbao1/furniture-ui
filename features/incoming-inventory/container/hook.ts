import { ContainerValues } from "@/lib/schema/incoming-inventory";
import { POContainerDetail } from "@/types/po";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPOContainer,
  deletePOContainer,
  getContainersByPurchaseOrder,
  updatePOContainer,
} from "./api";

interface UpdatePOContainerVariables {
  containerId: string;
  input: ContainerValues;
}

export function useCreatePOContainer() {
  const queryClient = useQueryClient();

  return useMutation<POContainerDetail, Error, ContainerValues>({
    mutationFn: createPOContainer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["po-containers"],
      });
    },
  });
}

export function useUpdatePOContainer() {
  const queryClient = useQueryClient();

  return useMutation<POContainerDetail, Error, UpdatePOContainerVariables>({
    mutationFn: ({ containerId, input }) =>
      updatePOContainer({ containerId, input }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["po-containers"],
      });
    },
  });
}

export function useGetContainersByPurchaseOrder(purchaseOrderId: string) {
  return useQuery<POContainerDetail[]>({
    queryKey: ["po-containers", purchaseOrderId],
    queryFn: () => getContainersByPurchaseOrder(purchaseOrderId!),
    enabled: !!purchaseOrderId,
  });
}

export function useDeletePOContainer() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { containerId: string }>({
    mutationFn: ({ containerId }) => deletePOContainer(containerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["po-containers"],
      });
    },
  });
}
