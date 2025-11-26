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
import { useMakeOrderPaid } from "@/features/checkout/hook";

interface PaidConfirmDialogProps {
  id: string;
  status: string;
  open: boolean;
  onClose: () => void;
}

const PaidConfirmDialog = ({
  id,
  status,
  open,
  onClose,
}: PaidConfirmDialogProps) => {
  const makeOrderPaidMutation = useMakeOrderPaid();

  const handleDelete = () => {
    makeOrderPaidMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success("Upadte order status successfully");
        onClose();
      },
      onError(error, variables, context) {
        toast.error("Upadte order status fail");
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
          <DialogTitle>Update order status</DialogTitle>
          <DialogDescription>
            Are you sure you want to update status of this order? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={makeOrderPaidMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            hasEffect
            variant="secondary"
            disabled={makeOrderPaidMutation.isPending}
          >
            {makeOrderPaidMutation.isPending ? (
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

export default PaidConfirmDialog;
