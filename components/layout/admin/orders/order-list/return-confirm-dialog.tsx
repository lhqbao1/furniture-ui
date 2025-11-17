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
import { Circle, Loader2, Trash2, Undo2 } from "lucide-react";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import { useRemoveFormEbay } from "@/features/ebay/hook";
import { useReturnOrder } from "@/features/checkout/hook";

interface ReturnConfirmDialogProps {
  id: string;
  status: string;
}

const ReturnConfirmDialog = ({ id, status }: ReturnConfirmDialogProps) => {
  const returnOrderMutation = useReturnOrder();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    returnOrderMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success("Return order successfully");
        setOpen(false);
      },
      onError(error, variables, context) {
        toast.error("Failed to return order");
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
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            if (status !== "Completed") {
              toast.error("Can not return this order due to its status");
            } else {
              setOpen(true); // ✅ Mở dialog nếu không phải eBay
            }
          }}
        >
          <Undo2 className="size-4 text-red-500" />
        </Button>
      </DialogTrigger>
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
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnConfirmDialog;
