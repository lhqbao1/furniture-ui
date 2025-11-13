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
import { useDeleteProduct } from "@/features/products/hook";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import { useRemoveFormEbay } from "@/features/ebay/hook";

type SelectedProduct = {
  product: ProductItem;
  amount: number;
  length: number;
  width: number;
  height: number;
  weight: number;
};

interface RemoveBundleDialogProps {
  product: ProductItem;
  setListProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
}

const RemoveBundleDialog = ({
  product,
  setListProducts,
}: RemoveBundleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true); // ⬅️ bật loading

    setTimeout(() => {
      setListProducts((prev) =>
        prev.filter((p) => p.product.id !== product.id)
      );

      setIsDeleting(false);
      setOpen(false); // ⬅️ đóng dialog sau khi xoá
    }, 800); // ⬅️ 800ms cho hiệu ứng xoá
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true); // ✅ Mở dialog nếu không phải eBay
          }}
        >
          <Trash2 className="size-4 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove this child</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            hasEffect
            variant="secondary"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveBundleDialog;
