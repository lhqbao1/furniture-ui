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
import { Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { useDeleteInventory } from "@/features/products/inventory/hook";

interface ProductInventoryDeleteDialogProps {
  id: string;
}

const ProductInventoryDeleteDialog = ({
  id,
}: ProductInventoryDeleteDialogProps) => {
  const deleteInventoryMutation = useDeleteInventory();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteInventoryMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success("Delete inventory data successfully");
        setOpen(false);
      },
      onError(error, variables, context) {
        toast.error("Delete inventory data fail");
        setOpen(false);
      },
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {/* 🗑 DELETE */}
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-red-50 hover:border-red-600 hover:border"
        >
          <Trash className="w-4 h-4 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Inventory Data</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this inventory Data? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={deleteInventoryMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            hasEffect
            variant="secondary"
            disabled={deleteInventoryMutation.isPending}
          >
            {deleteInventoryMutation.isPending ? (
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

export default ProductInventoryDeleteDialog;
