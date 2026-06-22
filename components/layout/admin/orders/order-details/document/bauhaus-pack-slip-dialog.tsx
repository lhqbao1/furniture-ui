"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";
import { DownloadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BauhausReturnSlipPdf } from "@/components/layout/pdf/bauhaus-return-slip";
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
import { Label } from "@/components/ui/label";
import { filterInvoiceCheckouts } from "@/lib/checkout-filter";
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
  const [isGenerating, setIsGenerating] = React.useState(false);

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

  const handleDownload = async () => {
    if (!canDownload || isGenerating) return;

    setIsGenerating(true);

    try {
      const blob = await pdf(
        <BauhausReturnSlipPdf
          checkout={checkout}
          invoice={invoice}
          productNumbers={normalizedProductNumbers}
        />,
      ).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to generate Bauhaus pack slip", error);
      toast.error("Failed to download Bauhaus pack slip.");
    } finally {
      setIsGenerating(false);
    }
  };

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
          <Button
            type="button"
            className="gap-2"
            disabled={!canDownload || isGenerating}
            onClick={() => void handleDownload()}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <DownloadCloud className="size-4" />
            )}
            {isGenerating ? "Generating..." : "Download Pack Slip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
