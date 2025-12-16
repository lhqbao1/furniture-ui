"use client";
import React from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCancelNoStockOrder,
  useCancelOrder,
} from "@/features/checkout/hook";

interface ReturnConfirmDialogProps {
  id: string;
  status: string;
  open: boolean; // 🔥 nhận từ parent
  onClose: () => void;
}

const CancelNoStockConfirmDialog = ({
  id,
  status,
  open,
  onClose,
}: ReturnConfirmDialogProps) => {
  const cancelNoStockOrderMutation = useCancelNoStockOrder();

  const handleCancel = () => {
    cancelNoStockOrderMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success("Cancel order successfully");
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
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={cancelNoStockOrderMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCancel}
            hasEffect
            variant="secondary"
            disabled={cancelNoStockOrderMutation.isPending}
          >
            {cancelNoStockOrderMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelNoStockConfirmDialog;
