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
import { toast } from "sonner";
import { useDeleteSupplier } from "@/features/supplier/hook";
import { MarketplaceProduct, ProductItem } from "@/types/products";
import { useRemoveFormEbay } from "@/features/ebay/hook";
import { useRemoveFormKaufland } from "@/features/kaufland/hook";
import { useRemoveFromAmazon } from "@/features/amazon/hook";

interface RemoveFromMarketplaceDialogProps {
  marketplace: string;
  marketplaceProduct: MarketplaceProduct;
  product: ProductItem;
}

const RemoveFromMarketplaceDialog = ({
  marketplace,
  marketplaceProduct,
  product,
}: RemoveFromMarketplaceDialogProps) => {
  const [open, setOpen] = useState(false);

  const removeFromEbayMutation = useRemoveFormEbay();
  const removeFromKauflandMutation = useRemoveFormKaufland();
  const removeFromAmazonMutation = useRemoveFromAmazon();

  const handleRemove = () => {
    if (marketplace === "ebay" && marketplaceProduct) {
      removeFromEbayMutation.mutate(product.id_provider, {
        onSuccess: () => {
          toast.success("Removed from eBay successfully");
          setOpen(false);
        },
        onError: () => {
          toast.error("Removed from Ebay failed");
          setOpen(false);
        },
      });
    } else if (marketplace === "kaufland" && marketplaceProduct) {
      removeFromKauflandMutation.mutate(
        product.marketplace_products.find((m) => m.marketplace === "kaufland")
          ?.marketplace_offer_id ?? "",
        {
          onSuccess: () => {
            toast.success("Removed from Kaufland successfully");
            setOpen(false);
          },
          onError: () => {
            toast.error("Removed from Kaufland failed");
            setOpen(false);
          },
        },
      );
    } else if (marketplace === "amazon" && marketplaceProduct) {
      removeFromAmazonMutation.mutate(product.sku, {
        onSuccess: () => {
          toast.success("Removed from Amazon successfully");
          setOpen(false);
        },
        onError: () => {
          toast.error("Removed from Amazon failed");
          setOpen(false);
        },
      });
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-400 bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Remove From {marketplace}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {product.name} from {marketplace}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={
                removeFromEbayMutation.isPending ||
                removeFromKauflandMutation.isPending
              }
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => {
              handleRemove();
            }}
            hasEffect
            disabled={
              removeFromEbayMutation.isPending ||
              removeFromKauflandMutation.isPending
            }
          >
            {removeFromEbayMutation.isPending ||
            removeFromKauflandMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFromMarketplaceDialog;
