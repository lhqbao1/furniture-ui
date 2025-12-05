"use client";

import React, { useMemo, useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FastForward, Loader2, Tag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useGetProductsSelect } from "@/features/product-group/hook";
import { useAssignVoucherToProduct } from "@/features/vouchers/hook";
import Image from "next/image";
import { toast } from "sonner";

interface AssignProps {
  voucher_id: string;
  voucher_code: string;
}

const AssignVoucherToProducts = ({ voucher_id, voucher_code }: AssignProps) => {
  const { data: listProducts = [], isLoading } = useGetProductsSelect({
    all_products: false,
  });

  const assignMutation = useAssignVoucherToProduct();

  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  /** 🔍 FILTER PRODUCTS BY SEARCH */
  const filtered = useMemo(() => {
    return listProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, listProducts]);

  /** 🔄 When product is selected → move to top */
  const sortedProducts = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aSelected = selectedProducts.includes(a.id);
      const bSelected = selectedProducts.includes(b.id);
      return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
    });
  }, [filtered, selectedProducts]);

  /** ✔ Toggle select */
  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /** ✔ Confirm assign */
  const handleConfirm = () => {
    assignMutation.mutate(
      {
        voucher_id,
        product_ids: selectedProducts,
      },
      {
        onSuccess() {
          toast.success("Assigned successfully!");
        },
        onError() {
          toast.error("Failed to assign!");
        },
      },
    );
  };

  return (
    <Drawer direction="right">
      {/* Trigger */}
      <DrawerTrigger asChild>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:border-secondary hover:bg-green-50 hover:border"
                >
                  <Tag className="text-green-600" />
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="bg-white text-black"
              arrowColor="white"
            >
              Assign to Products
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DrawerTrigger>

      {/* Drawer */}
      <DrawerContent className="p-6 w-[800px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[800px] mx-auto">
        <DrawerHeader className="p-0">
          <DrawerTitle>Assign Voucher to Products</DrawerTitle>
        </DrawerHeader>

        {/* Voucher ID */}
        <p className="text-sm text-muted-foreground mb-4">
          Voucher:{" "}
          <span className="font-bold text-secondary">{voucher_code}</span>
        </p>

        {/* Search */}
        <Input
          placeholder="Search products..."
          className="mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Product List */}
        <div className="max-h-[700px] overflow-auto space-y-3 px-2 py-2 border rounded-md">
          {isLoading && <div>Loading...</div>}

          {sortedProducts.map((product) => {
            const checked = selectedProducts.includes(product.id);

            return (
              <div
                key={product.id}
                className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleProduct(product.id)} // 🔥 Click cả div sẽ toggle
              >
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src={product.static_files[0].url}
                    height={50}
                    width={50}
                    alt=""
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {product.id}
                    </p>
                  </div>
                </div>

                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleProduct(product.id)}
                  onClick={(e) => e.stopPropagation()} // ❗ Ngăn div click event
                />
              </div>
            );
          })}
        </div>

        <DrawerFooter>
          <Button
            onClick={handleConfirm}
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirm Assign"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AssignVoucherToProducts;
