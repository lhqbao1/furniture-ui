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
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import { useCancelOrder } from "@/features/checkout/hook";
import { toast } from "sonner";

interface CancelOrderDialogProps {
  id: string;
  code: string;
}

const CancelOrderDialog = ({ id, code }: CancelOrderDialogProps) => {
  const t = useTranslations("cancelOrder");
  const [open, setOpen] = useState(false);

  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = () => {
    cancelOrderMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success(t("cancelOrderSuccess"));
      },
      onError(error, variables, context) {
        toast.error(t("cancelOrderError"));
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
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true); // ✅ Mở dialog nếu không phải eBay
          }}
          className="capitalize"
        >
          {t("cancelOrderTitle")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("cancelOrderTitle")}: {code}
          </DialogTitle>
          <DialogDescription>{t("cancelOrderConfirm")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
            >
              {t("close")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCancelOrder}
            hasEffect
            variant="secondary"
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("cancel")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderDialog;
