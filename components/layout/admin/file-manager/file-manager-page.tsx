"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";
import { format } from "date-fns";
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  File as FileIcon,
  Folder,
  FolderOpen,
  Home,
  Loader2,
  MoreHorizontal,
  MoveRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useCreateFileNode,
  useDeleteFileNode,
  useGetFileNode,
  useGetFolderItems,
  useMoveFileNode,
  useUpdateFileNode,
  useUploadFileManagerFiles,
} from "@/features/file-manager/hook";
import { cn } from "@/lib/utils";
import type { FileNode, FileNodeType } from "@/types/file-manager";

const EMPTY_VALUE = "-";
const EMPTY_FILE_NODES: FileNode[] = [];

type MoveDestination = {
  id: string | null;
  name: string;
};

function formatDateTime(value?: string | null) {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return format(date, "MMM dd, yyyy HH:mm");
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function normalizeValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function sanitizeUploadFile(file: File) {
  return new File([file], file.name.replace(/\s+/g, "-"), {
    type: file.type,
    lastModified: file.lastModified,
  });
}

function getNodeIcon(type: FileNodeType) {
  return type === "FOLDER" ? Folder : FileIcon;
}

function NodeTypeBadge({ type }: { type: FileNodeType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1",
        type === "FOLDER"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-sky-200 bg-sky-50 text-sky-700",
      )}
    >
      {type === "FOLDER" ? "Folder" : "File"}
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 break-all font-medium text-slate-900">
        {value || EMPTY_VALUE}
      </span>
    </div>
  );
}

function getPreviewType(node: FileNode) {
  if (node.type !== "FILE" || !node.storage_key) return "none";

  const source = `${node.name} ${node.storage_key}`.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/.test(source)) return "image";
  if (/\.pdf(\?|#|$)/.test(source)) return "pdf";

  return "file";
}

function FileNodePreview({ node }: { node: FileNode }) {
  const previewType = getPreviewType(node);

  if (node.type !== "FILE") {
    return (
      <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-800">
        Open this folder to view its contents.
      </div>
    );
  }

  if (!node.storage_key) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        This file has no storage key.
      </div>
    );
  }

  if (previewType === "file") {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
        <FileIcon className="size-10 text-sky-500" />
        <div>
          <div className="font-semibold text-slate-900">Preview unavailable</div>
          <div className="mt-1 text-sm text-slate-500">
            Open the file in a new tab to review it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
        Preview
      </div>
      <object
        data={node.storage_key}
        type={previewType === "pdf" ? "application/pdf" : undefined}
        className="h-[260px] w-full bg-white"
        aria-label={`Preview ${node.name}`}
      >
        <div className="flex h-[260px] flex-col items-center justify-center gap-2 p-4 text-center text-sm text-slate-500">
          <FileIcon className="size-9 text-sky-500" />
          Preview could not be loaded in this panel.
        </div>
      </object>
    </div>
  );
}

function FolderTreeNode({
  node,
  level,
  path,
  selectedFolderId,
  onOpen,
}: {
  node: FileNode;
  level: number;
  path: FileNode[];
  selectedFolderId: string | null;
  onOpen: (folder: FileNode, path: FileNode[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const childItemsQuery = useGetFolderItems({
    parent_id: node.id,
    enabled: expanded,
  });
  const childFolders = useMemo(
    () =>
      (childItemsQuery.data ?? EMPTY_FILE_NODES).filter(
        (child) => child.type === "FOLDER",
      ),
    [childItemsQuery.data],
  );
  const isSelected = selectedFolderId === node.id;

  return (
    <div>
      <div
        className={cn(
          "group flex h-9 items-center gap-1 rounded-md pr-2 text-sm transition-colors",
          isSelected
            ? "bg-sky-100 text-sky-900"
            : "text-slate-700 hover:bg-slate-100",
        )}
        style={{ paddingLeft: `${level * 14 + 6}px` }}
      >
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded hover:bg-white/70"
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? "Collapse folder" : "Expand folder"}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onOpen(node, path)}
        >
          <Folder className="size-4 shrink-0 text-amber-500" />
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {expanded ? (
        <div className="mt-1">
          {childItemsQuery.isLoading ? (
            <div className="space-y-1 px-3 py-1">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-4/5" />
            </div>
          ) : null}
          {!childItemsQuery.isLoading &&
            childFolders.map((child) => (
              <FolderTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                path={[...path, child]}
                selectedFolderId={selectedFolderId}
                onOpen={onOpen}
              />
            ))}
        </div>
      ) : null}
    </div>
  );
}

export function FileManagerPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FileNode[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploadDropActive, setIsUploadDropActive] = useState(false);

  const [renameNode, setRenameNode] = useState<FileNode | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [moveNodeTarget, setMoveNodeTarget] = useState<FileNode | null>(null);
  const [moveBrowserFolderId, setMoveBrowserFolderId] = useState<string | null>(
    null,
  );
  const [moveBrowserBreadcrumbs, setMoveBrowserBreadcrumbs] = useState<
    FileNode[]
  >([]);
  const [moveDestination, setMoveDestination] = useState<MoveDestination>({
    id: null,
    name: "Root",
  });

  const [deleteNodeTarget, setDeleteNodeTarget] = useState<FileNode | null>(
    null,
  );

  const folderItemsQuery = useGetFolderItems({
    parent_id: currentFolderId,
  });
  const rootItemsQuery = useGetFolderItems({
    parent_id: null,
  });
  const moveBrowserItemsQuery = useGetFolderItems({
    parent_id: moveBrowserFolderId,
    enabled: Boolean(moveNodeTarget),
  });
  const selectedNodeQuery = useGetFileNode(
    selectedNodeId ?? undefined,
    Boolean(selectedNodeId),
  );

  const createFileNodeMutation = useCreateFileNode();
  const uploadFileMutation = useUploadFileManagerFiles();
  const updateFileNodeMutation = useUpdateFileNode();
  const moveFileNodeMutation = useMoveFileNode();
  const deleteFileNodeMutation = useDeleteFileNode();

  const folderItems = folderItemsQuery.data ?? EMPTY_FILE_NODES;
  const rootFolders = useMemo(
    () =>
      (rootItemsQuery.data ?? EMPTY_FILE_NODES).filter(
        (node) => node.type === "FOLDER",
      ),
    [rootItemsQuery.data],
  );
  const moveBrowserFolders = useMemo(
    () =>
      (moveBrowserItemsQuery.data ?? EMPTY_FILE_NODES).filter(
        (node) => node.type === "FOLDER" && node.id !== moveNodeTarget?.id,
      ),
    [moveBrowserItemsQuery.data, moveNodeTarget?.id],
  );
  const selectedNodeFromList =
    folderItems.find((node) => node.id === selectedNodeId) ?? null;
  const selectedNode =
    selectedNodeQuery.data ?? selectedNodeFromList ?? null;
  const shouldShowDetailLoading =
    Boolean(selectedNodeId) && selectedNodeQuery.isLoading && !selectedNodeFromList;
  const shouldShowDetailError =
    Boolean(selectedNodeId) && selectedNodeQuery.isError && !selectedNodeFromList;

  const filteredItems = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return folderItems;

    return folderItems.filter((node) => {
      return [node.name, node.type, node.storage_key, node.id, node.parent_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [folderItems, searchValue]);

  const currentFolderName = breadcrumbs.at(-1)?.name ?? "Root";
  const moveBrowserFolderName = moveBrowserBreadcrumbs.at(-1)?.name ?? "Root";
  const folderCount = folderItems.filter((node) => node.type === "FOLDER").length;
  const fileCount = folderItems.filter((node) => node.type === "FILE").length;
  const isCreatingFolder = createFileNodeMutation.isPending;
  const isUploading =
    uploadFileMutation.isPending || createFileNodeMutation.isPending;
  const isRenaming = updateFileNodeMutation.isPending;
  const isMoving = moveFileNodeMutation.isPending;
  const isDeleting = deleteFileNodeMutation.isPending;

  const openFolder = (node: FileNode, nextBreadcrumbs = [...breadcrumbs, node]) => {
    if (node.type !== "FOLDER") return;

    setCurrentFolderId(node.id);
    setBreadcrumbs(nextBreadcrumbs);
    setSelectedNodeId(null);
    setSearchValue("");
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setBreadcrumbs([]);
    setSelectedNodeId(null);
    setSearchValue("");
  };

  const navigateToBreadcrumb = (node: FileNode, index: number) => {
    setCurrentFolderId(node.id);
    setBreadcrumbs((current) => current.slice(0, index + 1));
    setSelectedNodeId(null);
    setSearchValue("");
  };

  const navigateUp = () => {
    if (breadcrumbs.length === 0) return;

    if (breadcrumbs.length === 1) {
      navigateToRoot();
      return;
    }

    const nextBreadcrumbs = breadcrumbs.slice(0, -1);
    const parent = nextBreadcrumbs.at(-1);
    setCurrentFolderId(parent?.id ?? null);
    setBreadcrumbs(nextBreadcrumbs);
    setSelectedNodeId(null);
    setSearchValue("");
  };

  const navigateMoveBrowserToRoot = () => {
    setMoveBrowserFolderId(null);
    setMoveBrowserBreadcrumbs([]);
  };

  const navigateMoveBrowserToFolder = (node: FileNode, path?: FileNode[]) => {
    setMoveBrowserFolderId(node.id);
    setMoveBrowserBreadcrumbs(path ?? [...moveBrowserBreadcrumbs, node]);
  };

  const navigateMoveBrowserToBreadcrumb = (node: FileNode, index: number) => {
    setMoveBrowserFolderId(node.id);
    setMoveBrowserBreadcrumbs((current) => current.slice(0, index + 1));
  };

  const selectMoveDestination = (destination: MoveDestination) => {
    setMoveDestination(destination);
  };

  const copyText = async (value?: string | null, label = "Value") => {
    if (!value) {
      toast.error(`${label} is empty`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const openSelectedNode = () => {
    if (!selectedNode) return;

    if (selectedNode.type === "FOLDER") {
      openFolder(selectedNode, [...breadcrumbs, selectedNode]);
      return;
    }

    if (selectedNode.storage_key) {
      window.open(selectedNode.storage_key, "_blank", "noopener,noreferrer");
    }
  };

  const handleCreateFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = normalizeValue(newFolderName);
    if (!name) {
      toast.error("Folder name is required");
      return;
    }

    createFileNodeMutation.mutate(
      {
        name,
        parent_id: currentFolderId,
        type: "FOLDER",
        storage_key: null,
      },
      {
        onSuccess: (node) => {
          toast.success("Folder created");
          setSelectedNodeId(node.id);
          setNewFolderOpen(false);
          setNewFolderName("");
        },
        onError: () => toast.error("Could not create folder"),
      },
    );
  };

  const handleUploadFileList = (fileList?: FileList | null) => {
    if (!fileList?.length) return;

    setUploadFiles((current) => [...current, ...Array.from(fileList)]);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetUploadDialog = () => {
    setUploadFiles([]);
    setIsUploadDropActive(false);
  };

  const handleUploadDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsUploadDropActive(false);
    handleUploadFileList(event.dataTransfer.files);
  };

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleUploadFileList(event.target.files);
    event.target.value = "";
  };

  const submitUploadFiles = async () => {
    if (uploadFiles.length === 0) {
      toast.error("Choose at least one file");
      return;
    }

    const formData = new FormData();
    const sanitizedFiles = uploadFiles.map(sanitizeUploadFile);
    sanitizedFiles.forEach((file) => formData.append("files", file));

    try {
      const uploadResponse = await uploadFileMutation.mutateAsync(formData);
      const uploadedFiles = uploadResponse.results ?? [];

      if (uploadedFiles.length === 0) {
        toast.error("Upload succeeded but no URL was returned");
        return;
      }

      const createdNodes = await Promise.all(
        uploadedFiles.map((file, index) =>
          createFileNodeMutation.mutateAsync({
            name:
              normalizeValue(file.filename) ??
              sanitizedFiles[index]?.name ??
              `Uploaded file ${index + 1}`,
            parent_id: currentFolderId,
            type: "FILE",
            storage_key: file.url,
          }),
        ),
      );

      toast.success(`${createdNodes.length} file(s) uploaded`);
      setSelectedNodeId(createdNodes.at(-1)?.id ?? null);
      setUploadOpen(false);
      resetUploadDialog();
    } catch {
      toast.error("Could not upload file");
    }
  };

  const handleUploadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitUploadFiles();
  };

  const handleRenameNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!renameNode) return;

    const name = normalizeValue(renameValue);
    if (!name) {
      toast.error("Name is required");
      return;
    }

    updateFileNodeMutation.mutate(
      {
        nodeId: renameNode.id,
        input: { name },
      },
      {
        onSuccess: (node) => {
          toast.success("Name updated");
          setSelectedNodeId(node.id);
          setRenameNode(null);
          setRenameValue("");
        },
        onError: () => toast.error("Could not update file node"),
      },
    );
  };

  const handleMoveNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!moveNodeTarget) return;

    moveFileNodeMutation.mutate(
      {
        nodeId: moveNodeTarget.id,
        input: {
          parent_id: moveDestination.id,
        },
      },
      {
        onSuccess: (node) => {
          toast.success("Node moved");
          setSelectedNodeId(node.id);
          setMoveNodeTarget(null);
        },
        onError: () => toast.error("Could not move file node"),
      },
    );
  };

  const handleDeleteNode = () => {
    if (!deleteNodeTarget) return;

    deleteFileNodeMutation.mutate(deleteNodeTarget.id, {
      onSuccess: () => {
        toast.success("Node deleted");
        if (selectedNodeId === deleteNodeTarget.id) {
          setSelectedNodeId(null);
        }
        setDeleteNodeTarget(null);
      },
      onError: () => toast.error("Could not delete file node"),
    });
  };

  const openRenameDialog = (node: FileNode) => {
    setRenameNode(node);
    setRenameValue(node.name);
    setSelectedNodeId(node.id);
  };

  const openMoveDialog = (node: FileNode) => {
    setMoveNodeTarget(node);
    setSelectedNodeId(node.id);
    setMoveBrowserFolderId(null);
    setMoveBrowserBreadcrumbs([]);
    setMoveDestination({ id: null, name: "Root" });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 md:px-8">
      <div className="mx-auto max-w-[1580px]">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">File Manager</h1>
            <p className="text-sm text-slate-500">CRM / File Manager</p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-white bg-white px-3 py-1 text-slate-600 shadow-sm"
          >
            {folderCount} folders · {fileCount} files
          </Badge>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNewFolderOpen(true)}
              className="h-9 border-emerald-200 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            >
              <Plus className="size-4" />
              New folder
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUploadOpen(true)}
              className="h-9 border-sky-200 bg-sky-50 px-3 text-sky-700 hover:bg-sky-100 hover:text-sky-800"
            >
              <Upload className="size-4" />
              Upload
            </Button>
            <Separator orientation="vertical" className="mx-1 h-7" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!selectedNode}
              onClick={openSelectedNode}
              className="h-9 border-indigo-200 bg-indigo-50 px-3 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 disabled:opacity-50"
            >
              {selectedNode?.type === "FILE" ? (
                <ExternalLink className="size-4" />
              ) : (
                <FolderOpen className="size-4" />
              )}
              Open
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!selectedNode}
              onClick={() => selectedNode && openRenameDialog(selectedNode)}
              className="h-9 border-amber-200 bg-amber-50 px-3 text-amber-700 hover:bg-amber-100 hover:text-amber-800 disabled:opacity-50"
            >
              <Pencil className="size-4" />
              Rename
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedNode}
                    onClick={() => selectedNode && openMoveDialog(selectedNode)}
                    className="h-9 border-orange-200 bg-orange-50 px-3 text-orange-700 hover:bg-orange-100 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MoveRight className="size-4" />
                    Move
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {selectedNode
                  ? "Move selected file or folder"
                  : "Select a file or folder before moving"}
              </TooltipContent>
            </Tooltip>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!selectedNode}
              onClick={() => selectedNode && setDeleteNodeTarget(selectedNode)}
              className="h-9 border-red-200 bg-red-50 px-3 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
            <div className="ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => folderItemsQuery.refetch()}
                    disabled={folderItemsQuery.isFetching}
                    className="size-9 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn(
                        "size-4",
                        folderItemsQuery.isFetching && "animate-spin",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid min-h-[720px] lg:grid-cols-[280px_minmax(0,1fr)_330px]">
            <aside className="border-r border-slate-200 bg-slate-50/80">
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="text-sm font-semibold text-slate-700">
                  Folders
                </div>
              </div>
              <div className="h-[676px] overflow-y-auto px-2 py-3">
                <button
                  type="button"
                  className={cn(
                    "mb-2 flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm transition-colors",
                    currentFolderId === null
                      ? "bg-sky-100 text-sky-900"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                  onClick={navigateToRoot}
                >
                  <Home className="size-4 shrink-0 text-slate-500" />
                  <span>Root</span>
                </button>

                {rootItemsQuery.isLoading ? (
                  <div className="space-y-2 px-2 py-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-5/6" />
                    <Skeleton className="h-8 w-4/6" />
                  </div>
                ) : null}

                {!rootItemsQuery.isLoading && rootFolders.length === 0 ? (
                  <div className="px-3 py-5 text-sm text-slate-500">
                    No folders
                  </div>
                ) : null}

                {!rootItemsQuery.isLoading
                  ? rootFolders.map((folder) => (
                      <FolderTreeNode
                        key={folder.id}
                        node={folder}
                        level={0}
                        path={[folder]}
                        selectedFolderId={currentFolderId}
                        onOpen={openFolder}
                      />
                    ))
                  : null}
              </div>
            </aside>

            <main className="min-w-0">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 xl:flex-row xl:items-center">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={breadcrumbs.length === 0}
                        onClick={navigateUp}
                        className="size-10"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Up</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex min-h-10 min-w-0 flex-1 items-center gap-1 overflow-hidden rounded-md border border-slate-200 bg-slate-50 px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 px-2"
                    onClick={navigateToRoot}
                  >
                    <Home className="size-4" />
                    Root
                  </Button>
                  {breadcrumbs.map((node, index) => (
                    <div key={node.id} className="flex min-w-0 items-center">
                      <ChevronRight className="size-4 shrink-0 text-slate-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 min-w-0 max-w-[220px] justify-start px-2"
                        onClick={() => navigateToBreadcrumb(node, index)}
                      >
                        <span className="truncate">{node.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="relative w-full xl:max-w-[340px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search"
                    className="h-10 bg-white pl-10"
                  />
                </div>
              </div>

              <div className="h-[622px] overflow-auto">
                {folderItemsQuery.isError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <Database className="size-10 text-red-400" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Could not load items
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        API returned an error for this folder.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => folderItemsQuery.refetch()}
                    >
                      <RefreshCw className="size-4" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Table containerClassName="overflow-visible">
                    <TableHeader className="sticky top-0 z-10 bg-slate-50">
                      <TableRow className="hover:bg-slate-50">
                        <TableHead className="w-[42%] px-4 py-3">
                          Name
                        </TableHead>
                        <TableHead className="px-4 py-3">Type</TableHead>
                        <TableHead className="px-4 py-3">Modified</TableHead>
                        <TableHead className="px-4 py-3">Storage key</TableHead>
                        <TableHead className="w-[72px] px-4 py-3 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {folderItemsQuery.isLoading
                        ? Array.from({ length: 10 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell className="px-4 py-3">
                                <Skeleton className="h-6 w-[280px]" />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Skeleton className="h-6 w-[82px]" />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Skeleton className="h-6 w-[140px]" />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Skeleton className="h-6 w-[220px]" />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Skeleton className="ml-auto h-6 w-8" />
                              </TableCell>
                            </TableRow>
                          ))
                        : null}

                      {!folderItemsQuery.isLoading &&
                      filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-[480px]">
                            <div className="flex flex-col items-center justify-center gap-3 text-center text-slate-500">
                              <FolderOpen className="size-12 text-slate-300" />
                              <span>No items</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}

                      {!folderItemsQuery.isLoading
                        ? filteredItems.map((node) => {
                            const Icon = getNodeIcon(node.type);
                            const isSelected = selectedNodeId === node.id;

                            return (
                              <TableRow
                                key={node.id}
                                data-state={isSelected ? "selected" : undefined}
                                className={cn(
                                  "cursor-default",
                                  isSelected && "bg-sky-50 hover:bg-sky-50",
                                )}
                                onClick={() => setSelectedNodeId(node.id)}
                                onDoubleClick={() => {
                                  if (node.type === "FOLDER") {
                                    openFolder(node);
                                  } else if (node.storage_key) {
                                    window.open(
                                      node.storage_key,
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }
                                }}
                              >
                                <TableCell className="px-4 py-2.5 whitespace-normal">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span
                                      className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-md border",
                                        node.type === "FOLDER"
                                          ? "border-amber-200 bg-amber-50 text-amber-600"
                                          : "border-sky-200 bg-sky-50 text-sky-600",
                                      )}
                                    >
                                      <Icon className="size-5" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="line-clamp-1 font-medium text-slate-950">
                                        {node.name}
                                      </span>
                                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                                        {node.id}
                                      </span>
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                  <NodeTypeBadge type={node.type} />
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-slate-600">
                                  {formatDateTime(node.updated_at)}
                                </TableCell>
                                <TableCell className="max-w-[280px] px-4 py-2.5">
                                  <span className="block truncate text-slate-600">
                                    {node.storage_key || EMPTY_VALUE}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto size-8"
                                      >
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-44"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => setSelectedNodeId(node.id)}
                                      >
                                        <Database className="size-4" />
                                        Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (node.type === "FOLDER") {
                                            openFolder(node);
                                          } else if (node.storage_key) {
                                            window.open(
                                              node.storage_key,
                                              "_blank",
                                              "noopener,noreferrer",
                                            );
                                          }
                                        }}
                                      >
                                        {node.type === "FOLDER" ? (
                                          <FolderOpen className="size-4" />
                                        ) : (
                                          <ExternalLink className="size-4" />
                                        )}
                                        Open
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => openRenameDialog(node)}
                                      >
                                        <Pencil className="size-4" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => openMoveDialog(node)}
                                      >
                                        <MoveRight className="size-4" />
                                        Move
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => copyText(node.id, "Node ID")}
                                      >
                                        <Copy className="size-4" />
                                        Copy ID
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => {
                                          setDeleteNodeTarget(node);
                                          setSelectedNodeId(node.id);
                                        }}
                                      >
                                        <Trash2 className="size-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        : null}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                <span>
                  {filteredItems.length} item(s)
                  {selectedNode ? ` · 1 selected` : ""}
                </span>
                <span>{currentFolderName}</span>
              </div>
            </main>

            <aside className="border-l border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="text-sm font-semibold text-slate-700">
                  Details
                </div>
              </div>

              <div className="h-[676px] overflow-y-auto p-4">
                {shouldShowDetailLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                ) : null}

                {!selectedNodeId ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
                    <Database className="size-10 text-slate-300" />
                    <span>Select an item</span>
                  </div>
                ) : null}

                {shouldShowDetailError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <Database className="size-10 text-red-400" />
                    <div>
                      <h3 className="font-semibold">Detail unavailable</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Could not load this node.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => selectedNodeQuery.refetch()}
                    >
                      <RefreshCw className="size-4" />
                      Retry
                    </Button>
                  </div>
                ) : null}

                {selectedNode && !shouldShowDetailLoading ? (
                  <div className="space-y-5">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div
                        className={cn(
                          "flex size-16 items-center justify-center rounded-lg border",
                          selectedNode.type === "FOLDER"
                            ? "border-amber-200 bg-amber-50 text-amber-600"
                            : "border-sky-200 bg-sky-50 text-sky-600",
                        )}
                      >
                        {selectedNode.type === "FOLDER" ? (
                          <Folder className="size-8" />
                        ) : (
                          <FileIcon className="size-8" />
                        )}
                      </div>
                      <div className="w-full">
                        <div className="line-clamp-3 text-base font-semibold">
                          {selectedNode.name}
                        </div>
                        <div className="mt-2 flex justify-center">
                          <NodeTypeBadge type={selectedNode.type} />
                        </div>
                      </div>
                    </div>

                    <FileNodePreview node={selectedNode} />

                    <Separator />

                    <div className="space-y-3">
                      <DetailRow label="ID" value={selectedNode.id} />
                      <DetailRow label="Parent ID" value={selectedNode.parent_id} />
                      <DetailRow
                        label="Storage key"
                        value={selectedNode.storage_key}
                      />
                      <DetailRow
                        label="Created"
                        value={formatDateTime(selectedNode.created_at)}
                      />
                      <DetailRow
                        label="Updated"
                        value={formatDateTime(selectedNode.updated_at)}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openSelectedNode}
                      >
                        {selectedNode.type === "FOLDER" ? (
                          <FolderOpen className="size-4" />
                        ) : (
                          <ExternalLink className="size-4" />
                        )}
                        Open
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copyText(selectedNode.id, "Node ID")}
                      >
                        <Copy className="size-4" />
                        Copy ID
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openRenameDialog(selectedNode)}
                      >
                        <Pencil className="size-4" />
                        Rename
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openMoveDialog(selectedNode)}
                      >
                        <MoveRight className="size-4" />
                        Move
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      </div>

      <Dialog
        open={newFolderOpen}
        onOpenChange={(open) => {
          setNewFolderOpen(open);
          if (!open) setNewFolderName("");
        }}
      >
        <DialogContent className="max-w-[480px]">
          <form onSubmit={handleCreateFolder} className="space-y-5">
            <DialogHeader>
              <DialogTitle>New folder</DialogTitle>
              <DialogDescription>Parent: {currentFolderName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="new-folder-name">Folder name</Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="Folder name"
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingFolder}>
                {isCreatingFolder ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) resetUploadDialog();
        }}
      >
        <DialogContent className="max-w-[660px]">
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Upload files</DialogTitle>
              <DialogDescription>Parent: {currentFolderName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <input
                id="file-manager-upload-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleUploadInputChange}
              />
              <label
                htmlFor="file-manager-upload-input"
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsUploadDropActive(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsUploadDropActive(false);
                }}
                onDrop={handleUploadDrop}
                className={cn(
                  "flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 px-6 py-8 text-center transition-colors",
                  isUploadDropActive
                    ? "border-secondary bg-secondary/10"
                    : "border-slate-300 hover:border-secondary/60 hover:bg-emerald-50/40",
                )}
              >
                <Upload className="mb-3 size-10 text-slate-400" />
                <div className="text-base font-semibold text-slate-800">
                  Drop files here or choose files
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Files are uploaded first, then saved as file nodes.
                </div>
              </label>

              {uploadFiles.length > 0 ? (
                <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
                  {uploadFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0"
                    >
                      <FileIcon className="size-4 shrink-0 text-sky-600" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {file.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatBytes(file.size)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => removeUploadFile(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isUploading || uploadFiles.length === 0}
                onClick={() => {
                  void submitUploadFiles();
                }}
              >
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : null}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renameNode)} onOpenChange={() => setRenameNode(null)}>
        <DialogContent className="max-w-[480px]">
          <form onSubmit={handleRenameNode} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Rename</DialogTitle>
              <DialogDescription>{renameNode?.id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="rename-node-name">Name</Label>
              <Input
                id="rename-node-name"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameNode(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(moveNodeTarget)}
        onOpenChange={(open) => {
          if (!open) setMoveNodeTarget(null);
        }}
      >
        <DialogContent className="max-w-[760px]">
          <form onSubmit={handleMoveNode} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Move</DialogTitle>
              <DialogDescription>{moveNodeTarget?.name}</DialogDescription>
            </DialogHeader>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-medium uppercase text-slate-500">
                Destination
              </div>
              <div className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                {moveDestination.id ? (
                  <Folder className="size-4 text-amber-500" />
                ) : (
                  <Home className="size-4 text-slate-500" />
                )}
                {moveDestination.name}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={navigateMoveBrowserToRoot}
                >
                  <Home className="size-4" />
                  Root
                </Button>
                {moveBrowserBreadcrumbs.map((node, index) => (
                  <div key={node.id} className="flex min-w-0 items-center">
                    <ChevronRight className="size-4 shrink-0 text-slate-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 max-w-[180px] justify-start px-2"
                      onClick={() => navigateMoveBrowserToBreadcrumb(node, index)}
                    >
                      <span className="truncate">{node.name}</span>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8"
                  onClick={() =>
                    selectMoveDestination({
                      id: moveBrowserFolderId,
                      name: moveBrowserFolderName,
                    })
                  }
                >
                  <Check className="size-4" />
                  Choose this folder
                </Button>
              </div>

              <div className="h-[300px] overflow-y-auto bg-white">
                {moveBrowserItemsQuery.isLoading ? (
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-5/6" />
                    <Skeleton className="h-10 w-4/6" />
                  </div>
                ) : null}

                {!moveBrowserItemsQuery.isLoading &&
                moveBrowserFolders.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                    <FolderOpen className="size-9 text-slate-300" />
                    <span>No folders</span>
                  </div>
                ) : null}

                {!moveBrowserItemsQuery.isLoading
                  ? moveBrowserFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0"
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-slate-50"
                          onClick={() => navigateMoveBrowserToFolder(folder)}
                        >
                          <Folder className="size-5 shrink-0 text-amber-500" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {folder.name}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {folder.id}
                            </span>
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() =>
                            selectMoveDestination({
                              id: folder.id,
                              name: folder.name,
                            })
                          }
                        >
                          <Check className="size-4" />
                          Choose
                        </Button>
                      </div>
                    ))
                  : null}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMoveNodeTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMoving}>
                {isMoving ? <Loader2 className="size-4 animate-spin" /> : null}
                Move
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteNodeTarget)}
        onOpenChange={() => setDeleteNodeTarget(null)}
      >
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>
              {deleteNodeTarget?.name ?? "Selected item"}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            This action deletes the selected file node.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteNodeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="red"
              onClick={handleDeleteNode}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
