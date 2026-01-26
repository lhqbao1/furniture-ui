"use client";
import { Button } from "@/components/ui/button";
import {
  useImportAmmProducts,
  useImportProductToAmm,
} from "@/features/amm/hook";
import { ProductItem } from "@/types/products";
import React from "react";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import Image from "next/image";
import { Check } from "lucide-react";
import { useGetProductsSelect } from "@/features/product-group/hook";

const AMMProductImportPage = () => {
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductItem | null>(null);
  const [open, setOpen] = React.useState(false);

  const importAmmProductMutation = useImportProductToAmm();

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setOpen(false); // 👈 đóng popover ngay
  };
  const handleImport = () => {
    if (!selectedProduct) return;

    const payload = [selectedProduct.id_provider];

    const toastId = toast.loading("Importing product...");

    importAmmProductMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Product imported successfully", { id: toastId });
        setSelectedProduct(null);
      },
      onError: () => {
        toast.error("Failed to import product", { id: toastId });
      },
    });
  };

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsSelect({
    all_products: true,
  });

  return (
    <div>
      <h2 className="section-header mb-12">Import Product to AMM</h2>

      <div className="flex flex-col gap-0">
        <Popover
          open={open}
          onOpenChange={setOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[600px] justify-between"
            >
              {selectedProduct ? selectedProduct.name : "Select product"}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[600px] p-0">
            <Command>
              <CommandInput placeholder="Search products..." />
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {products?.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleSelectProduct(product)}
                  >
                    <div className="flex gap-2 items-center">
                      <Image
                        src={product.static_files?.[0]?.url ?? "/1.png"}
                        width={30}
                        height={30}
                        alt=""
                      />
                      <div>
                        <div className="truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.id_provider}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedProduct && (
          <div className="mt-2 text-sm space-y-2">
            <div>Name: {selectedProduct.name}</div>
            <div>ID: {selectedProduct.id_provider}</div>
            <div>
              Image:{" "}
              <Image
                src={
                  selectedProduct.static_files &&
                  selectedProduct.static_files.length > 0
                    ? selectedProduct.static_files[0].url
                    : "/1.png"
                }
                width={100}
                height={100}
                alt=""
              />
            </div>
          </div>
        )}
        <Button
          className="mt-4 w-fit"
          disabled={!selectedProduct || importAmmProductMutation.isPending}
          onClick={handleImport}
        >
          {importAmmProductMutation.isPending
            ? "Importing..."
            : "Import to AMM"}
        </Button>
      </div>
    </div>
  );
};

export default AMMProductImportPage;
