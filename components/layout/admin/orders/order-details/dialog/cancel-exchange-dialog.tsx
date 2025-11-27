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
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  useCancelExchangeOrder,
  useMakeOrderPaid,
} from "@/features/checkout/hook";

interface CancelExchangeDialogProps {
  id: string;
}

const CancelExchangeDialog = ({ id }: CancelExchangeDialogProps) => {
  const [open, setOpen] = useState(false);
  const cancelExchangeMutation = useCancelExchangeOrder();

  const handleCancelExchange = () => {
    cancelExchangeMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success("Cancel exchange successful");
        setOpen(false);
      },
      onError(data, variables, context) {
        toast.error("Cancel exchange fail");
        // setOpen(false);
      },
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-red-50"
        >
          <X className="w-4 h-4 text-red-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel exchange order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this exchange order? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={cancelExchangeMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCancelExchange}
            hasEffect
            variant="secondary"
            disabled={cancelExchangeMutation.isPending}
          >
            {cancelExchangeMutation.isPending ? (
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

export default CancelExchangeDialog;
