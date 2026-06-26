"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteProductGroup } from "@/features/product-group/hook";

interface DeleteGroupDialogProps {
  parentId: string;
}

const DeleteGroupDialog = ({ parentId }: DeleteGroupDialogProps) => {
  const deleteGroupMutation = useDeleteProductGroup();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteGroupMutation.mutate(parentId, {
      onSuccess() {
        toast.success("Delete group successfully");
        setOpen(false);
      },
      onError() {
        toast.error("Failed to delete group");
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Delete product group"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Product Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product group? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteGroupMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            variant="destructive"
            disabled={deleteGroupMutation.isPending}
          >
            {deleteGroupMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGroupDialog;
