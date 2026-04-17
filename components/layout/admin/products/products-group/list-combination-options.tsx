import { ChevronRight, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import {
  AddOptionToProductInput,
  ProductOptionData,
  VariantOptionResponse,
} from "@/types/variant";
import { toast } from "sonner";
import { useAddOptionToProduct } from "@/features/variant/hook";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { ProductItem } from "@/types/products";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useGetAllProducts } from "@/features/products/hook";

interface VariantCombinationsProps {
  combinations: VariantOptionResponse[][];
  productDetails: ProductGroupDetailResponse;
  filteredProduct: Record<number, string>;
}

export function filterProductsByCombinations(
  products: ProductItem[],
  combinations: VariantOptionResponse[][],
): Record<number, string> {
  const result: Record<number, string> = {};

  combinations.forEach((comb, index) => {
    const combIds = comb.map((o) => o.id).sort();

    const matchedProduct = products.find((product) => {
      const productOptionIds = product.options.map((o) => o.id).sort();
      return (
        combIds.length === productOptionIds.length &&
        combIds.every((id, idx) => id === productOptionIds[idx])
      );
    });

    if (matchedProduct) {
      result[index] = matchedProduct.id ?? "";
    }
  });

  return result;
}

export const VariantCombinations: React.FC<VariantCombinationsProps> = ({
  combinations,
  productDetails,
  filteredProduct,
}) => {
  const { watch } = useFormContext();
  const parent_id = watch("parent_id") || "";
  const [queryParams, setQueryParams] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [localCombinations, setLocalCombinations] = useState(combinations);
  const [selectedAction, setSelectedAction] =
    useState<Record<number, string>>(filteredProduct);
  const [selectedProductsById, setSelectedProductsById] = useState<
    Record<string, ProductItem>
  >({});
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const {
    data: listProductsSelect,
    isLoading: isLoadingSelect,
    isError: isErrorSelect,
  } = useGetAllProducts({
    search: debouncedQuery.trim(),
    page_size: 20,
    page: 1,
  });
  const searchableProducts: ProductItem[] = useMemo(() => {
    const payload = listProductsSelect as { items?: ProductItem[] } | undefined;
    return Array.isArray(payload?.items) ? payload.items : [];
  }, [listProductsSelect]);

  const addOptionToProductMutation = useAddOptionToProduct();

  useEffect(() => {
    setSelectedAction(filteredProduct);
    setLocalCombinations(combinations);
  }, [combinations, filteredProduct]);

  useEffect(() => {
    setSelectedProductsById((prev) => {
      const next = { ...prev };
      (productDetails?.products ?? []).forEach((product) => {
        const productId = String(product.id ?? "");
        if (!productId) return;
        next[productId] = product;
      });
      return next;
    });
  }, [productDetails?.products]);

  useEffect(() => {
    setSelectedProductsById((prev) => {
      const next = { ...prev };
      searchableProducts.forEach((product) => {
        const productId = String(product.id ?? "");
        if (!productId) return;
        next[productId] = product;
      });
      return next;
    });
  }, [searchableProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryParams);
    }, 350);
    return () => clearTimeout(timer);
  }, [queryParams]);

  const handleDeleteCombination = (idx: number) => {
    setLocalCombinations((prev) => prev.filter((_, i) => i !== idx));
    setSelectedAction((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const keyNumber = Number(key);
        if (keyNumber < idx) {
          next[keyNumber] = value;
        } else if (keyNumber > idx) {
          next[keyNumber - 1] = value;
        }
      });
      return next;
    });
  };

  if (combinations.length === 0)
    return (
      <p className="text-red-500">You need to add options to all attributes</p>
    );

  const handleSaveGroup = () => {
    const data = localCombinations.map((combination, idx) => {
      return {
        options: combination.map((opt) => opt.id!) as string[],
        product_id: selectedAction[idx],
      };
    });

    const filteredData: ProductOptionData[] = data.filter((item) =>
      Boolean(item.product_id),
    );

    const result: AddOptionToProductInput = {
      parent_id,
      data: filteredData,
    };

    addOptionToProductMutation.mutate(result, {
      onSuccess() {
        toast.success("Create product variant successful");
      },
      onError() {
        toast.error("Error occur");
      },
    });
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-start sm:justify-end">
        <Button type="button" onClick={handleSaveGroup} className="mt-4">
          Save group
        </Button>
      </div>
      <h3 className="font-semibold mb-4">Variant list:</h3>
      <div className="space-y-6">
        {localCombinations
          .filter((comb) => comb.length > 0)
          .map((combination, idx) => (
            <div key={idx} className="group rounded-lg border p-3 sm:p-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {combination.map((option, index) => (
                    <React.Fragment key={option.id ?? index}>
                      <div>
                        {option.image_url ? (
                          <Image
                            src={option.image_url}
                            alt={option.label}
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="rounded-sm border-2 px-2 py-1">
                            {option.label}
                          </span>
                        )}
                      </div>
                      {index < combination.length - 1 && (
                        <Plus size={16} className="text-black" />
                      )}
                    </React.Fragment>
                  ))}

                  <button
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50"
                    onClick={() => handleDeleteCombination(idx)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Popover
                    open={openIdx === idx}
                    onOpenChange={(isOpen) => {
                      setOpenIdx(isOpen ? idx : null);
                      setQueryParams("");
                      setDebouncedQuery("");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="flex-1 justify-between py-1 h-12"
                      >
                        {(() => {
                          const selectedId = String(selectedAction[idx] ?? "");
                          const selectedProduct = selectedProductsById[selectedId];

                          return selectedAction[idx] ? (
                            <span className="truncate text-left">
                              {selectedProduct?.name ?? "Product selected"}
                            </span>
                          ) : (
                            <span className="text-sm">Select product</span>
                          );
                        })()}
                        <ChevronRight className="shrink-0" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-150 p-0 pointer-events-auto z-[120]">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search product..."
                          value={queryParams}
                          onValueChange={(value) => setQueryParams(value)}
                        />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup className="max-h-[320px] overflow-y-auto">
                          {debouncedQuery.trim().length < 2 && (
                            <CommandItem disabled>
                              Type at least 2 characters to search
                            </CommandItem>
                          )}
                          {debouncedQuery.trim().length >= 2 &&
                            isLoadingSelect && (
                              <CommandItem disabled>Loading...</CommandItem>
                            )}
                          {debouncedQuery.trim().length >= 2 &&
                            isErrorSelect && (
                              <CommandItem disabled>
                                Error loading products
                              </CommandItem>
                            )}
                          {debouncedQuery.trim().length >= 2 &&
                            searchableProducts
                              .filter(
                                (product) =>
                                  !Object.entries(selectedAction)
                                    .filter(([key]) => Number(key) !== idx)
                                    .some(
                                      ([, value]) =>
                                        String(value ?? "") ===
                                        String(product.id ?? ""),
                                    ),
                              )
                              .map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.id ?? ""}
                                  onSelect={() => {
                                    const selectedId = String(product.id ?? "");

                                    setSelectedAction((prev) => ({
                                      ...prev,
                                      [idx]: selectedId,
                                    }));
                                    setSelectedProductsById((prev) => ({
                                      ...prev,
                                      [selectedId]: product,
                                    }));
                                    setQueryParams("");
                                    setDebouncedQuery("");
                                    setOpenIdx(null);
                                  }}
                                  className="flex items-center gap-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <Image
                                      src={
                                        (product.static_files?.length ?? 0) > 0
                                          ? product.static_files[0].url
                                          : "/placeholder-product.webp"
                                      }
                                      height={25}
                                      width={25}
                                      alt=""
                                      className="rounded-sm"
                                      unoptimized
                                    />
                                    <div className="min-w-0">
                                      <p className="truncate">{product.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        ID: {product.id_provider ?? "-"} | SKU:{" "}
                                        {product.sku?.trim() ? product.sku : "-"}
                                      </p>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
