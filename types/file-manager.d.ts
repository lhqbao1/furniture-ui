export type FileNodeType = "FILE" | "FOLDER";

export type FileNode = {
  id: string;
  name: string;
  type: FileNodeType;
  parent_id: string | null;
  storage_key: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateFileNodeInput = {
  name: string;
  parent_id?: string | null;
  type: FileNodeType;
  storage_key?: string | null;
};

export type UpdateFileNodeInput = {
  name: string;
};

export type UpdateFileNodePayload = {
  nodeId: string;
  input: UpdateFileNodeInput;
};

export type MoveFileNodeInput = {
  parent_id?: string | null;
};

export type MoveFileNodePayload = {
  nodeId: string;
  input: MoveFileNodeInput;
};

export type GetFolderItemsParams = {
  parent_id?: string | null;
};
