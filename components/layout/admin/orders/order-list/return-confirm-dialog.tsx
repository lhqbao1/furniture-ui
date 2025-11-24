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
import { Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useReturnOrder } from "@/features/checkout/hook";

interface ReturnConfirmDialogProps {
  id: string;
  status: string;
  open: boolean;
  onClose: () => void;
}

const ReturnConfirmDialog = ({
  id,
  status,
  open,
  onClose,
}: ReturnConfirmDialogProps) => {
  const returnOrderMutation = useReturnOrder();

  const handleDelete = () => {
    returnOrderMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success("Return order successfully");
        onClose();
      },
      onError(error, variables, context) {
        toast.error("Failed to return order");
        onClose();
      },
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to return this order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={returnOrderMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            hasEffect
            variant="secondary"
            disabled={returnOrderMutation.isPending}
          >
            {returnOrderMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Return"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnConfirmDialog;
