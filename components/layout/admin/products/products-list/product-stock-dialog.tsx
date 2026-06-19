"use client";

import { useState, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateStockProduct } from "@/features/products/inventory/hook";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { adminIdAtom } from "@/store/auth";
import type { ProductItem } from "@/types/products";

interface ProductStockDialogProps {
  product: ProductItem;
  children: ReactNode;
}

const toStockNumber = (value: unknown) => {
  const stock = Number(value);
  return Number.isFinite(stock) ? stock : 0;
};

const StockValueCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className="mt-1 text-xl font-semibold text-slate-900">
      {value.toLocaleString("de-DE")} pcs.
    </div>
  </div>
);

const ProductStockDialog = ({ product, children }: ProductStockDialogProps) => {
  const adminId = useAtomValue(adminIdAtom);
  const updateStockMutation = useUpdateStockProduct();
  const currentPhysicalStock = toStockNumber(product.stock);
  const reservedStock = Math.abs(toStockNumber(product.result_stock));
  const availableStock = calculateAvailableStock(product);
  const isBundleProduct =
    product.is_bundle === true || (product.bundles?.length ?? 0) > 0;

  const [open, setOpen] = useState(false);
  const [physicalStock, setPhysicalStock] = useState(
    String(currentPhysicalStock),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setPhysicalStock(String(currentPhysicalStock));
    }
  };

  const nextPhysicalStock = Number(physicalStock);
  const canSubmit =
    !isBundleProduct &&
    physicalStock.trim() !== "" &&
    Number.isInteger(nextPhysicalStock) &&
    nextPhysicalStock >= 0 &&
    nextPhysicalStock !== currentPhysicalStock &&
    !updateStockMutation.isPending;

  const handleUpdatePhysicalStock = async () => {
    if (!canSubmit) return;

    try {
      await updateStockMutation.mutateAsync({
        payload: {
          product_id: product.id,
          quantity: nextPhysicalStock - currentPhysicalStock,
          user_id: adminId ?? "",
        },
      });
      toast.success("Physical stock updated successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to update physical stock");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl">
        <DialogHeader>
          <DialogTitle>Stock details</DialogTitle>
          <DialogDescription>
            {product.name} · #{product.id_provider}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <StockValueCard label="Available" value={availableStock} />
          <StockValueCard label="Physical" value={currentPhysicalStock} />
          <StockValueCard label="Reserved" value={reservedStock} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`physical-stock-${product.id}`}
            className="text-sm font-medium text-slate-900"
          >
            Physical stock
          </label>
          <Input
            id={`physical-stock-${product.id}`}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={physicalStock}
            disabled={isBundleProduct || updateStockMutation.isPending}
            onChange={(event) => setPhysicalStock(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSubmit) {
                event.preventDefault();
                void handleUpdatePhysicalStock();
              }
            }}
          />
          {isBundleProduct ? (
            <p className="text-sm text-muted-foreground">
              Bundle physical stock is derived from its component products and
              cannot be edited directly.
            </p>
          ) : physicalStock.trim() !== "" &&
            (!Number.isInteger(nextPhysicalStock) || nextPhysicalStock < 0) ? (
            <p className="text-sm text-destructive">
              Physical stock must be a non-negative whole number.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={updateStockMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdatePhysicalStock}
            disabled={!canSubmit}
          >
            {updateStockMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductStockDialog;
