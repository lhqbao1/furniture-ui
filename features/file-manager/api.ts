import { apiAdmin } from "@/lib/axios";
import {
  CreateFileNodeInput,
  FileNode,
  GetFolderItemsParams,
  MoveFileNodeInput,
  UpdateFileNodeInput,
} from "@/types/file-manager";

const FOLDER_API_PATH = "/folder";

export async function createFileNode(input: CreateFileNodeInput) {
  const { data } = await apiAdmin.post(`${FOLDER_API_PATH}/create`, input);
  return data as FileNode;
}

export async function updateFileNode(
  nodeId: string,
  input: UpdateFileNodeInput,
) {
  const { data } = await apiAdmin.put(
    `${FOLDER_API_PATH}/update/${nodeId}`,
    input,
  );
  return data as FileNode;
}

export async function moveFileNode(nodeId: string, input: MoveFileNodeInput) {
  const { data } = await apiAdmin.put(
    `${FOLDER_API_PATH}/move/${nodeId}`,
    input,
  );
  return data as FileNode;
}

export async function getFileNode(nodeId: string) {
  const { data } = await apiAdmin.get(
    `${FOLDER_API_PATH}/file-node/${nodeId}`,
  );
  return data as FileNode;
}

export async function deleteFileNode(nodeId: string) {
  const { data } = await apiAdmin.delete(
    `${FOLDER_API_PATH}/file-node/${nodeId}`,
  );
  return data;
}

export async function getFolderItems(params: GetFolderItemsParams = {}) {
  const { data } = await apiAdmin.get(`${FOLDER_API_PATH}/folder-items`, {
    params: {
      ...(params.parent_id ? { parent_id: params.parent_id } : {}),
    },
  });

  return data as FileNode[];
}
