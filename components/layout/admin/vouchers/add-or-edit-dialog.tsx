"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
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
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl max-h-[92vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
            <DialogTitle className="text-2xl font-semibold">
              {isEdit ? "Edit Voucher" : "Add Voucher"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4">
            <AddOrEditVouchersForm
              onClose={handleClose}
              {...(voucherValues ? { voucherValues } : {})}
            />
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddVoucherDialog;
