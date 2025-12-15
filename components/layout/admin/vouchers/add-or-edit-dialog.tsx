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
import AddOrEditVouchersForm from "./add-or-edit-form/add-or-edit-form";
import { Pencil } from "lucide-react";
import { VoucherItem } from "@/types/voucher";

interface AddVoucherDialogProps {
  isEdit?: boolean;
  voucherValues?: VoucherItem;
}

const AddVoucherDialog = ({
  isEdit = false,
  voucherValues,
}: AddVoucherDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <form>
        <DialogTrigger asChild>
          {isEdit ? (
            <Button
              variant="ghost"
              size="icon"
              title="Edit Voucher"
              className="hover:bg-amber-50 hover:border-primary hover:border"
            >
              <Pencil className="w-4 h-4 text-primary" />
            </Button>
          ) : (
            <Button
              className=""
              variant="secondary"
            >
              Add Voucher
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Voucher" : "Add Voucher"}</DialogTitle>
          </DialogHeader>
          <AddOrEditVouchersForm
            onClose={handleClose}
            {...(voucherValues ? { voucherValues } : {})}
          />
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddVoucherDialog;
