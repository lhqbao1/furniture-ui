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
import DownloadCSVStamm from "@/components/layout/admin/amm/download-csv-stamm";
import Link from "next/link";
import { useGetAllProducts } from "@/features/products/hook";

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const AMMProductImportPage = () => {
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductItem | null>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 400);

  const importAmmProductMutation = useImportProductToAmm();

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setOpen(false); // 👈 đóng popover ngay
  };
  const handleImport = () => {
    if (!selectedProduct) return;
    if (!selectedProduct.packages || selectedProduct.packages.length === 0)
      return toast.error("Product is missing the package number");

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
  } = useGetAllProducts({
    page_size: 20,
    page: 1,
    search: debouncedSearch, // 👈 dùng debounce
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
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search products..."
                value={search}
                onValueChange={setSearch}
              />

              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {isLoading && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}

                {!isLoading &&
                  products?.items?.map((product) => (
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
            <div>Sku: {selectedProduct.sku}</div>
            <div>EAN: {selectedProduct.ean}</div>

            <div className="flex gap-2 items-center">
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
                className="h-[50px] w-auto"
              />
            </div>
            {!selectedProduct.packages ||
              (selectedProduct.packages.length === 0 && (
                <Link
                  href={`/admin/products/${selectedProduct.id}/edit`}
                  className="text-red-600 underline"
                >
                  Missing package data
                </Link>
              ))}
          </div>
        )}
        <div className="flex gap-1.5 mt-4">
          <Button
            className="w-fit"
            disabled={!selectedProduct || importAmmProductMutation.isPending}
            onClick={handleImport}
          >
            {importAmmProductMutation.isPending
              ? "Importing..."
              : "Import to AMM"}
          </Button>

          {selectedProduct && <DownloadCSVStamm product={selectedProduct} />}
        </div>
      </div>
    </div>
  );
};

export default AMMProductImportPage;
