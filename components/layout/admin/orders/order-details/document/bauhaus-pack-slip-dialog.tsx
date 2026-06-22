"use client";

import React from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { DownloadCloud, Loader2 } from "lucide-react";
import { BauhausReturnSlipPdf } from "@/components/layout/pdf/bauhaus-return-slip";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filterInvoiceCheckouts } from "@/lib/checkout-filter";
import { cn } from "@/lib/utils";
import { CheckOutMain } from "@/types/checkout";
import { InvoiceResponse } from "@/types/invoice";

interface BauhausPackSlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkout: CheckOutMain;
  invoice: InvoiceResponse;
  fileName: string;
}

export default function BauhausPackSlipDialog({
  open,
  onOpenChange,
  checkout,
  invoice,
  fileName,
}: BauhausPackSlipDialogProps) {
  const items = React.useMemo(() => {
    const checkouts = filterInvoiceCheckouts(
      invoice.main_checkout?.checkouts ?? checkout.checkouts,
    );

    return checkouts.flatMap((childCheckout) => {
      if (Array.isArray(childCheckout.cart)) {
        return childCheckout.cart.flatMap((cart) => cart.items ?? []);
      }

      return childCheckout.cart?.items ?? [];
    });
  }, [checkout.checkouts, invoice.main_checkout?.checkouts]);
  const [productNumbers, setProductNumbers] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    if (!open) return;

    setProductNumbers(
      Object.fromEntries(items.map((item) => [item.id, ""])),
    );
  }, [items, open]);

  const normalizedProductNumbers = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(productNumbers).map(([itemId, value]) => [
          itemId,
          value.trim(),
        ]),
      ),
    [productNumbers],
  );
  const canDownload =
    items.length > 0 &&
    items.every((item) => Boolean(normalizedProductNumbers[item.id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bauhaus Pack Slip</DialogTitle>
          <DialogDescription>
            Enter the Produktnummer for every item. These values will appear in
            the corresponding rows of the PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </p>
                <p className="font-medium leading-snug">
                  {item.products?.name || item.purchased_products?.name || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  SKU: {item.products?.sku || item.purchased_products?.sku || "—"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`produktnummer-${item.id}`}>
                  Produktnummer
                </Label>
                <Input
                  id={`produktnummer-${item.id}`}
                  value={productNumbers[item.id] ?? ""}
                  placeholder="Enter Produktnummer"
                  autoComplete="off"
                  onChange={(event) =>
                    setProductNumbers((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {canDownload ? (
            <BlobProvider
              document={
                <BauhausReturnSlipPdf
                  checkout={checkout}
                  invoice={invoice}
                  productNumbers={normalizedProductNumbers}
                />
              }
            >
              {({ url, loading }) => {
                const isDisabled = loading || !url;

                return (
                  <a
                    href={isDisabled ? undefined : url}
                    download={fileName}
                    aria-disabled={isDisabled}
                    className={cn(
                      buttonVariants(),
                      "gap-2",
                      isDisabled && "pointer-events-none opacity-50",
                    )}
                    onClick={(event) => {
                      if (isDisabled) {
                        event.preventDefault();
                        return;
                      }
                      onOpenChange(false);
                    }}
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <DownloadCloud className="size-4" />
                    )}
                    {loading ? "Generating..." : "Download Pack Slip"}
                  </a>
                );
              }}
            </BlobProvider>
          ) : (
            <Button type="button" disabled className="gap-2">
              <DownloadCloud className="size-4" />
              Download Pack Slip
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
