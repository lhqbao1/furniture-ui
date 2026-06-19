"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateMainCheckout } from "@/features/checkout/hook";
import { User } from "@/types/user";
import { Loader2, Pencil } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type VatSummaryRow = {
  percent: number;
  vat: number;
};

interface OrderInformationProps {
  main_checkout_id: string;
  payment_method?: string;
  language: string;
  external_id?: string;
  warehouse?: string;
  referrer?: string;
  owner?: User;
  order_type?: string;
  shipping_profile?: string;
  package_number?: string;
  entry_date?: Date;
  client?: string;
  sub_total?: number;
  shipping_amount?: number;
  discount_amount?: number;
  tax?: number;
  vat_rows?: VatSummaryRow[];
  total_amount?: number;
  is_Ebay?: boolean;
  refund_amount: number | null;
}

const OrderSummary = ({
  main_checkout_id,
  payment_method,
  language,
  external_id,
  warehouse,
  referrer,
  owner,
  order_type,
  shipping_profile,
  package_number,
  entry_date,
  client,
  sub_total,
  shipping_amount,
  discount_amount,
  tax,
  vat_rows = [],
  total_amount,
  refund_amount,
  is_Ebay = false,
}: OrderInformationProps) => {
  const updateMainCheckoutMutation = useUpdateMainCheckout();
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [shippingAmountInput, setShippingAmountInput] = useState("");

  const formatEuro = (value: number | undefined) =>
    `€${(value ?? 0).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalAfterRefund = Math.max(
    (total_amount ?? 0) - (refund_amount ?? 0),
    0,
  );

  const formatVatLabel = (percent: number) => {
    const safePercent = Number(percent) || 0;
    const roundedPercent = Math.round(safePercent * 100) / 100;

    return `VAT (${roundedPercent.toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}%)`;
  };

  const currentShippingAmount = Number(shipping_amount) || 0;
  const parseShippingAmount = (value: string) => {
    const normalized = value.trim().replace(/\s/g, "");
    if (!normalized) return Number.NaN;

    return Number(
      normalized.includes(",")
        ? normalized.replaceAll(".", "").replace(",", ".")
        : normalized,
    );
  };
  const nextShippingAmount = parseShippingAmount(shippingAmountInput);
  const isShippingAmountValid =
    Number.isFinite(nextShippingAmount) && nextShippingAmount >= 0;
  const isShippingAmountUnchanged =
    isShippingAmountValid &&
    Number(nextShippingAmount.toFixed(2)) ===
      Number(currentShippingAmount.toFixed(2));

  const handleShippingDialogOpenChange = (open: boolean) => {
    setShippingDialogOpen(open);
    if (open) {
      setShippingAmountInput(currentShippingAmount.toFixed(2));
    }
  };

  const handleUpdateShippingAmount = async () => {
    if (!isShippingAmountValid || isShippingAmountUnchanged) return;

    try {
      await updateMainCheckoutMutation.mutateAsync({
        main_checkout_id,
        payload: {
          shipping_amount: Number(nextShippingAmount.toFixed(2)),
        },
      });
      toast.success("Shipping amount updated successfully");
      setShippingDialogOpen(false);
    } catch {
      toast.error("Failed to update shipping amount");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Summary</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-slate-600">Sub total</div>
          <div className="text-right font-medium text-slate-900">
            {formatEuro(sub_total)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-slate-600">Shipping</div>
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Edit shipping amount"
              className="size-7 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => handleShippingDialogOpenChange(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <div className="text-right font-medium text-slate-900">
              {formatEuro(shipping_amount)}
            </div>
          </div>
        </div>
        {discount_amount && discount_amount > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-slate-600">Discount (gross)</div>
            <div className="text-right font-medium text-slate-900">
              {formatEuro(discount_amount)}
            </div>
          </div>
        ) : null}
        {vat_rows.length > 0 ? (
          vat_rows.map((row) => (
            <div
              className="grid grid-cols-2 gap-3"
              key={`vat-row-${row.percent}`}
            >
              <div className="text-slate-600">
                {formatVatLabel(row.percent)}
              </div>
              <div className="text-right font-medium text-slate-900">
                {formatEuro(row.vat)}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-slate-600">VAT</div>
            <div className="text-right font-medium text-slate-900">
              {formatEuro(tax)}
            </div>
          </div>
        )}
        {refund_amount && refund_amount > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-slate-600">Refund Amount</div>
            <div className="text-right font-medium text-red-600">
              -{formatEuro(refund_amount)}
            </div>
          </div>
        ) : null}

        <div className="my-2 h-px w-full bg-slate-200" />

        <div className="grid grid-cols-2 gap-3 text-base">
          <div className="font-semibold text-slate-900">Total</div>
          <div className="text-right text-xl font-bold text-primary">
            {formatEuro(totalAfterRefund)}
          </div>
        </div>
      </div>

      <Dialog
        open={shippingDialogOpen}
        onOpenChange={handleShippingDialogOpenChange}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shipping</DialogTitle>
            <DialogDescription>
              Only the shipping amount will be updated for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="shipping-amount"
              className="text-sm font-medium text-slate-900"
            >
              Shipping amount (€)
            </label>
            <Input
              id="shipping-amount"
              type="text"
              inputMode="decimal"
              autoFocus
              value={shippingAmountInput}
              disabled={updateMainCheckoutMutation.isPending}
              onChange={(event) => setShippingAmountInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  isShippingAmountValid &&
                  !isShippingAmountUnchanged &&
                  !updateMainCheckoutMutation.isPending
                ) {
                  event.preventDefault();
                  void handleUpdateShippingAmount();
                }
              }}
            />
            {shippingAmountInput.trim() && !isShippingAmountValid ? (
              <p className="text-sm text-destructive">
                Shipping amount must be zero or greater.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShippingDialogOpen(false)}
              disabled={updateMainCheckoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateShippingAmount}
              disabled={
                !isShippingAmountValid ||
                isShippingAmountUnchanged ||
                updateMainCheckoutMutation.isPending
              }
            >
              {updateMainCheckoutMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderSummary;
