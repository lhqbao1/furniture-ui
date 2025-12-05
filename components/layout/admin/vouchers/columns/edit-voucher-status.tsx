"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateVoucher } from "@/features/vouchers/hook";
import { VoucherItem } from "@/types/voucher";

interface Props {
  voucher: VoucherItem; // VoucherItem
}

export default function VoucherStatusCell({ voucher }: Props) {
  const [open, setOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState(voucher.is_active);
  const editVoucherMutation = useUpdateVoucher();

  // Khi user bấm switch -> mở dialog, nhưng chưa lưu database
  const handleToggle = (checked: boolean) => {
    setTempStatus(checked);
    setOpen(true);
  };

  const onConfirm = () => {
    editVoucherMutation.mutate(
      {
        voucher_id: voucher.id,
        input: {
          ...voucher,
          is_active: tempStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to update status");
          setTempStatus(voucher.is_active); // rollback
          setOpen(false);
        },
      },
    );
  };

  const onCancel = () => {
    setTempStatus(voucher.is_active); // rollback nếu user không confirm
    setOpen(false);
  };

  return (
    <>
      {/* SWITCH */}
      <Switch
        checked={tempStatus}
        onCheckedChange={handleToggle}
        className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
      />

      {/* DIALOG CONFIRM */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>

          <p>
            Are you sure you want to mark this voucher as{" "}
            <span className="font-bold">
              {tempStatus ? "Active" : "Inactive"}
            </span>
            ?
          </p>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button onClick={onConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
