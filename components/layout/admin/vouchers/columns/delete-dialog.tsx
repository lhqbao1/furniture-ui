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
import { useDeleteSupplier } from "@/features/supplier/hook";
import { useDeleteVoucher } from "@/features/vouchers/hook";

interface DeleteDialogProps {
  voucher_id: string;
}

const DeleteDialog = ({ voucher_id }: DeleteDialogProps) => {
  const deleteVoucherMutation = useDeleteVoucher();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteVoucherMutation.mutate(voucher_id, {
      onSuccess(data, variables, context) {
        toast.success("Delete Voucher successfully");
        setOpen(false);
      },
      onError(error, variables, context) {
        toast.error("Delete Voucher fail");
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
          className="hover:border-red-400 hover:bg-red-50 hover:border"
          size={"icon"}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Voucher</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this Voucher? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={deleteVoucherMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => {
              handleDelete();
            }}
            hasEffect
            variant="secondary"
            disabled={deleteVoucherMutation.isPending}
          >
            {deleteVoucherMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
