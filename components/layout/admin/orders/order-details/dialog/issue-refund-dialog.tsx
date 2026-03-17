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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useReturnIssueOrder,
  useUpdateReasonForMainCheckout,
} from "@/features/checkout/hook";
import { Input } from "@/components/ui/input";

interface ReturnConfirmDialogProps {
  id: string;
  status: string;
  open: boolean; // 🔥 nhận từ parent
  onClose: () => void;
}

const IssueRefundDialog = ({
  id,
  open,
  onClose,
}: ReturnConfirmDialogProps) => {
  const returnIssueMutation = useReturnIssueOrder();
  const updateReasonMutation = useUpdateReasonForMainCheckout();
  const [amountRefund, setAmountRefund] = React.useState("");
  const [reason, setReason] = React.useState("");
  const isSubmitting =
    returnIssueMutation.isPending || updateReasonMutation.isPending;

  const handleConfirm = async () => {
    const parsedAmount = Number(amountRefund);
    const trimmedReason = reason.trim();

    if (
      !amountRefund.trim() ||
      Number.isNaN(parsedAmount) ||
      Number(parsedAmount) <= 0
    ) {
      toast.error("Refund amount must be greater than 0");
      return;
    }

    if (!trimmedReason) {
      toast.error("Reason is required");
      return;
    }

    try {
      await updateReasonMutation.mutateAsync({
        main_checkout_id: id,
        reason: trimmedReason,
      });

      await returnIssueMutation.mutateAsync({
        main_checkout_id: id,
        amount_refund: parsedAmount,
      });

      toast.success("Issue refund successfully");
      setAmountRefund("");
      setReason("");
      onClose();
    } catch (error) {
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to issue refund";

      toast.error("Failed to issue refund", {
        description: String(message),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="px-0 py-0"
          onClick={(e) => {
            e.preventDefault();
            if (status.toLocaleLowerCase() !== "paid") {
              toast.error("Can not cancel this order due to its status");
            } else {
              onClose();
            }
          }}
        >
          <X className="size-4 text-red-500" />
        </Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Refund Dialog</DialogTitle>
          <DialogDescription>
            Are you sure you want to refund this order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm font-medium">Refund amount</p>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={amountRefund}
            onChange={(e) => setAmountRefund(e.target.value)}
            placeholder="Enter refund amount"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Reason</p>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            hasEffect
            variant="secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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

export default IssueRefundDialog;
