import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileNode,
  deleteFileNode,
  getFileNode,
  getFolderItems,
  moveFileNode,
  updateFileNode,
} from "./api";
import {
  CreateFileNodeInput,
  GetFolderItemsParams,
  MoveFileNodePayload,
  UpdateFileNodePayload,
} from "@/types/file-manager";

export const fileManagerKeys = {
  all: ["file-manager"] as const,
  lists: () => [...fileManagerKeys.all, "list"] as const,
  list: (parentId?: string | null) =>
    [...fileManagerKeys.lists(), parentId ?? null] as const,
  details: () => [...fileManagerKeys.all, "detail"] as const,
  detail: (nodeId: string) => [...fileManagerKeys.details(), nodeId] as const,
};

export function useGetFolderItems({
  parent_id,
  enabled = true,
}: GetFolderItemsParams & { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: fileManagerKeys.list(parent_id),
    queryFn: () => getFolderItems({ parent_id }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetFileNode(nodeId?: string, enabled = true) {
  return useQuery({
    queryKey: fileManagerKeys.detail(nodeId ?? ""),
    queryFn: () => getFileNode(nodeId ?? ""),
    enabled: enabled && Boolean(nodeId),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateFileNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFileNodeInput) => createFileNode(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fileManagerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: fileManagerKeys.list(variables.parent_id),
      });
    },
  });
}

export function useUpdateFileNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, input }: UpdateFileNodePayload) =>
      updateFileNode(nodeId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fileManagerKeys.all });
      queryClient.invalidateQueries({
        queryKey: fileManagerKeys.detail(variables.nodeId),
      });
    },
  });
}

export function useMoveFileNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, input }: MoveFileNodePayload) =>
      moveFileNode(nodeId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fileManagerKeys.all });
      queryClient.invalidateQueries({
        queryKey: fileManagerKeys.detail(variables.nodeId),
      });
    },
  });
}

export function useDeleteFileNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) => deleteFileNode(nodeId),
    onSuccess: (_data, nodeId) => {
      queryClient.invalidateQueries({ queryKey: fileManagerKeys.lists() });
      queryClient.removeQueries({ queryKey: fileManagerKeys.detail(nodeId) });
    },
  });
}
