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
import { useDeletePurchaseOrder } from "@/features/incoming-inventory/po/hook";

interface DeletePODialogProps {
  poId: string;
}

const DeletePODialog = ({ poId }: DeletePODialogProps) => {
  const [open, setOpen] = useState(false);

  const deleteMutation = useDeletePurchaseOrder();
  const isLoading = deleteMutation.isPending;

  const handleDelete = () => {
    deleteMutation.mutate(poId, {
      onSuccess: () => {
        toast.success("Purchase order deleted successfully");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete purchase order");
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {/* 🔹 Trigger */}
      <DialogTrigger
        asChild
        className="border-none cursor-pointer"
      >
        <Trash2 className="h-5 w-5 text-red-500" />
      </DialogTrigger>

      {/* 🔹 Content */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete purchase order</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this purchase order? This action
          cannot be undone.
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

export default DeletePODialog;
