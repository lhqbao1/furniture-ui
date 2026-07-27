"use client";

import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronRight,
  Copy,
  Database,
  Eye,
  File,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "@/features/file-manager/hook";
import { cn } from "@/lib/utils";
import type { FileNode, FileNodeType } from "@/types/file-manager";

const EMPTY_VALUE = "-";
const EMPTY_FILE_NODES: FileNode[] = [];

function formatDateTime(value?: string | null) {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return format(date, "MMM dd, yyyy HH:mm");
}

function normalizeValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getNodeIcon(type: FileNodeType) {
  return type === "FOLDER" ? Folder : File;
}

function NodeTypeBadge({ type }: { type: FileNodeType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1",
        type === "FOLDER"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-sky-200 bg-sky-50 text-sky-700",
      )}
    >
      {type === "FOLDER" ? "Folder" : "File"}
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 break-all font-medium text-slate-900">
        {value || EMPTY_VALUE}
      </span>
    </div>
  );
}

export function FileManagerPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FileNode[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<FileNodeType>("FOLDER");
  const [createName, setCreateName] = useState("");
  const [createStorageKey, setCreateStorageKey] = useState("");

  const [renameNode, setRenameNode] = useState<FileNode | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [moveNodeTarget, setMoveNodeTarget] = useState<FileNode | null>(null);
  const [moveParentId, setMoveParentId] = useState("");

  const [deleteNodeTarget, setDeleteNodeTarget] = useState<FileNode | null>(
    null,
  );

  const folderItemsQuery = useGetFolderItems({
    parent_id: currentFolderId,
  });
  const selectedNodeQuery = useGetFileNode(
    selectedNodeId ?? undefined,
    Boolean(selectedNodeId),
  );

  const createFileNodeMutation = useCreateFileNode();
  const updateFileNodeMutation = useUpdateFileNode();
  const moveFileNodeMutation = useMoveFileNode();
  const deleteFileNodeMutation = useDeleteFileNode();

  const folderItems = folderItemsQuery.data ?? EMPTY_FILE_NODES;
  const selectedNode =
    selectedNodeQuery.data ??
    folderItems.find((node) => node.id === selectedNodeId) ??
    null;

  const filteredItems = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return folderItems;

    return folderItems.filter((node) => {
      return [node.name, node.type, node.storage_key, node.id, node.parent_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [folderItems, searchValue]);

  const availableMoveFolders = useMemo(() => {
    return folderItems.filter(
      (node) => node.type === "FOLDER" && node.id !== moveNodeTarget?.id,
    );
  }, [folderItems, moveNodeTarget?.id]);

  const folderCount = folderItems.filter((node) => node.type === "FOLDER").length;
  const fileCount = folderItems.filter((node) => node.type === "FILE").length;
  const isCreating = createFileNodeMutation.isPending;
  const isRenaming = updateFileNodeMutation.isPending;
  const isMoving = moveFileNodeMutation.isPending;
  const isDeleting = deleteFileNodeMutation.isPending;

  const openFolder = (node: FileNode) => {
    if (node.type !== "FOLDER") return;

    setCurrentFolderId(node.id);
    setBreadcrumbs((current) => [...current, node]);
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

  const resetCreateForm = () => {
    setCreateType("FOLDER");
    setCreateName("");
    setCreateStorageKey("");
  };

  const handleCreateNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = normalizeValue(createName);
    const storageKey = normalizeValue(createStorageKey);

    if (!name) {
      toast.error("Name is required");
      return;
    }

    if (createType === "FILE" && !storageKey) {
      toast.error("Storage key is required for file nodes");
      return;
    }

    createFileNodeMutation.mutate(
      {
        name,
        parent_id: currentFolderId,
        type: createType,
        storage_key: createType === "FILE" ? storageKey : null,
      },
      {
        onSuccess: (node) => {
          toast.success(`${node.type === "FOLDER" ? "Folder" : "File"} created`);
          setSelectedNodeId(node.id);
          setCreateOpen(false);
          resetCreateForm();
        },
        onError: () => toast.error("Could not create file node"),
      },
    );
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
          parent_id: normalizeValue(moveParentId),
        },
      },
      {
        onSuccess: (node) => {
          toast.success("Node moved");
          setSelectedNodeId(node.id);
          setMoveNodeTarget(null);
          setMoveParentId("");
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
    setMoveParentId(node.parent_id ?? "");
    setSelectedNodeId(node.id);
  };

  const currentFolderName = breadcrumbs.at(-1)?.name ?? "Root";

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-slate-950 md:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-secondary">File Manager</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-slate-700"
                onClick={navigateToRoot}
              >
                <Home className="size-4" />
                Root
              </Button>
              {breadcrumbs.map((node, index) => (
                <div key={node.id} className="flex items-center gap-2">
                  <ChevronRight className="size-4 text-slate-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 max-w-[220px] justify-start px-2 text-slate-700"
                    onClick={() => navigateToBreadcrumb(node, index)}
                  >
                    <span className="truncate">{node.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => folderItemsQuery.refetch()}
                  disabled={folderItemsQuery.isFetching}
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
            <Button
              type="button"
              className="bg-secondary text-white hover:bg-secondary/90"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              New node
            </Button>
          </div>
        </div>

        <section className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-md border border-emerald-100 bg-white px-4 py-3">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Current folder
                </div>
                <div className="mt-1 truncate text-lg font-semibold">
                  {currentFolderName}
                </div>
              </div>
              <div className="rounded-md border border-emerald-100 bg-white px-4 py-3">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Folders
                </div>
                <div className="mt-1 text-lg font-semibold">{folderCount}</div>
              </div>
              <div className="rounded-md border border-emerald-100 bg-white px-4 py-3">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Files
                </div>
                <div className="mt-1 text-lg font-semibold">{fileCount}</div>
              </div>
            </div>

            <div className="relative w-full lg:max-w-[420px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search name, id or storage key"
                className="h-11 bg-white pl-10"
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Folder items</h2>
                <p className="text-sm text-slate-500">
                  {filteredItems.length} of {folderItems.length} nodes
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
              >
                parent_id: {currentFolderId ?? "root"}
              </Badge>
            </div>

            {folderItemsQuery.isError ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <Database className="size-10 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold">Could not load items</h3>
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
              <Table containerClassName="max-h-[620px] overflow-auto">
                <TableHeader className="sticky top-0 z-10 bg-emerald-50">
                  <TableRow className="hover:bg-emerald-50">
                    <TableHead className="w-[38%] px-5 py-3">Name</TableHead>
                    <TableHead className="px-5 py-3">Type</TableHead>
                    <TableHead className="px-5 py-3">Storage key</TableHead>
                    <TableHead className="px-5 py-3">Updated</TableHead>
                    <TableHead className="w-[70px] px-5 py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folderItemsQuery.isLoading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="px-5 py-4">
                            <Skeleton className="h-6 w-[240px]" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Skeleton className="h-6 w-[80px]" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Skeleton className="h-6 w-[180px]" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Skeleton className="h-6 w-[130px]" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Skeleton className="ml-auto h-6 w-8" />
                          </TableCell>
                        </TableRow>
                      ))
                    : null}

                  {!folderItemsQuery.isLoading && filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-[320px] text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                          <FolderOpen className="size-10 text-slate-300" />
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
                          >
                            <TableCell className="px-5 py-3 whitespace-normal">
                              <button
                                type="button"
                                className="flex min-w-0 items-center gap-3 text-left"
                                onClick={() =>
                                  node.type === "FOLDER"
                                    ? openFolder(node)
                                    : setSelectedNodeId(node.id)
                                }
                              >
                                <span
                                  className={cn(
                                    "flex size-10 shrink-0 items-center justify-center rounded-md border",
                                    node.type === "FOLDER"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-sky-200 bg-sky-50 text-sky-700",
                                  )}
                                >
                                  <Icon className="size-5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="line-clamp-2 font-semibold text-slate-950">
                                    {node.name}
                                  </span>
                                  <span className="mt-1 block truncate text-xs text-slate-500">
                                    {node.id}
                                  </span>
                                </span>
                              </button>
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <NodeTypeBadge type={node.type} />
                            </TableCell>
                            <TableCell className="max-w-[260px] px-5 py-3">
                              <span className="block truncate text-slate-600">
                                {node.storage_key || EMPTY_VALUE}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-slate-600">
                              {formatDateTime(node.updated_at)}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto"
                                    onClick={() => setSelectedNodeId(node.id)}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem
                                    onClick={() => setSelectedNodeId(node.id)}
                                  >
                                    <Eye className="size-4" />
                                    Details
                                  </DropdownMenuItem>
                                  {node.type === "FOLDER" ? (
                                    <DropdownMenuItem onClick={() => openFolder(node)}>
                                      <FolderOpen className="size-4" />
                                      Open
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuItem
                                    onClick={() => openRenameDialog(node)}
                                  >
                                    <Pencil className="size-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openMoveDialog(node)}>
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
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold">Node detail</h2>
              <p className="text-sm text-slate-500">
                {selectedNodeId ? "Loaded from file-node API" : "No node selected"}
              </p>
            </div>

            <div className="p-5">
              {selectedNodeId && selectedNodeQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-11 w-11 rounded-md" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
              ) : null}

              {!selectedNodeId ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center text-slate-500">
                  <Eye className="size-10 text-slate-300" />
                  <span>Select a node to view details</span>
                </div>
              ) : null}

              {selectedNodeId && selectedNodeQuery.isError ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
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

              {selectedNode && !selectedNodeQuery.isLoading ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-md border",
                        selectedNode.type === "FOLDER"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-sky-200 bg-sky-50 text-sky-700",
                      )}
                    >
                      {selectedNode.type === "FOLDER" ? (
                        <Folder className="size-6" />
                      ) : (
                        <File className="size-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-lg font-semibold">
                        {selectedNode.name}
                      </div>
                      <div className="mt-2">
                        <NodeTypeBadge type={selectedNode.type} />
                      </div>
                    </div>
                  </div>

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
                    {selectedNode.type === "FOLDER" ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openFolder(selectedNode)}
                      >
                        <FolderOpen className="size-4" />
                        Open
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          copyText(selectedNode.storage_key, "Storage key")
                        }
                      >
                        <Copy className="size-4" />
                        Copy key
                      </Button>
                    )}
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
                    <Button
                      type="button"
                      variant="red"
                      className="col-span-2"
                      onClick={() => setDeleteNodeTarget(selectedNode)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="max-w-[560px]">
          <form onSubmit={handleCreateNode} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Create node</DialogTitle>
              <DialogDescription>
                Parent: {currentFolderName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Label>Type</Label>
              <RadioGroup
                value={createType}
                onValueChange={(value) => setCreateType(value as FileNodeType)}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  className={cn(
                    "cursor-pointer rounded-md border p-4",
                    createType === "FOLDER"
                      ? "border-secondary bg-secondary/10"
                      : "border-slate-200",
                  )}
                >
                  <RadioGroupItem value="FOLDER" />
                  <Folder className="size-4 text-emerald-600" />
                  Folder
                </Label>
                <Label
                  className={cn(
                    "cursor-pointer rounded-md border p-4",
                    createType === "FILE"
                      ? "border-secondary bg-secondary/10"
                      : "border-slate-200",
                  )}
                >
                  <RadioGroupItem value="FILE" />
                  <File className="size-4 text-sky-600" />
                  File
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-node-name">Name</Label>
              <Input
                id="file-node-name"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Name"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-node-storage-key">Storage key</Label>
              <Input
                id="file-node-storage-key"
                value={createStorageKey}
                onChange={(event) => setCreateStorageKey(event.target.value)}
                placeholder={
                  createType === "FILE" ? "Required for files" : "Optional"
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? <Loader2 className="size-4 animate-spin" /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renameNode)} onOpenChange={() => setRenameNode(null)}>
        <DialogContent className="max-w-[480px]">
          <form onSubmit={handleRenameNode} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Rename node</DialogTitle>
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
        onOpenChange={() => setMoveNodeTarget(null)}
      >
        <DialogContent className="max-w-[560px]">
          <form onSubmit={handleMoveNode} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Move node</DialogTitle>
              <DialogDescription>{moveNodeTarget?.name}</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="move-parent-id">New parent ID</Label>
              <Input
                id="move-parent-id"
                value={moveParentId}
                onChange={(event) => setMoveParentId(event.target.value)}
                placeholder="Empty means root"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMoveParentId("")}
              >
                <Home className="size-4" />
                Root
              </Button>
              {currentFolderId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMoveParentId(currentFolderId)}
                >
                  <Folder className="size-4" />
                  Current folder
                </Button>
              ) : null}
              {moveNodeTarget?.parent_id ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMoveParentId(moveNodeTarget.parent_id ?? "")}
                >
                  <MoveRight className="size-4" />
                  Original parent
                </Button>
              ) : null}
            </div>

            {availableMoveFolders.length > 0 ? (
              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                  Folders in current view
                </div>
                <div className="max-h-44 space-y-1 overflow-y-auto p-2">
                  {availableMoveFolders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-emerald-50",
                        moveParentId === folder.id &&
                          "bg-emerald-50 text-emerald-700",
                      )}
                      onClick={() => setMoveParentId(folder.id)}
                    >
                      <Folder className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {folder.name}
                      </span>
                      <span className="max-w-[160px] truncate text-xs text-slate-400">
                        {folder.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

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
            <DialogTitle>Delete node</DialogTitle>
            <DialogDescription>
              {deleteNodeTarget?.name ?? "Selected node"}
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
