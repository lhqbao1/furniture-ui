"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeletePOContainer } from "@/features/incoming-inventory/container/hook";

interface DeleteDialogConfirmProps {
  containerId: string;
}

const DeleteDialogConfirm = ({ containerId }: DeleteDialogConfirmProps) => {
  const [open, setOpen] = useState(false);

  const deleteMutation = useDeletePOContainer();

  const isLoading = deleteMutation.isPending;

  const handleDelete = () => {
    deleteMutation.mutate(
      {
        containerId,
      },
      {
        onSuccess: () => {
          toast.success("Container deleted successfully");
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete container");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>

      {/* 🔹 Content */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete container</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this container? This action cannot be
          undone.
        </p>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialogConfirm;
