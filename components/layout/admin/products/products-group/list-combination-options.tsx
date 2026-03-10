import { ChevronRight, Eye, Plus, X } from "lucide-react";
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
import Link from "next/link";
import { useLocale } from "next-intl";
import { useGetProductsSelect } from "@/features/product-group/hook";

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
  const locale = useLocale();

  const [selectedAction, setSelectedAction] =
    useState<Record<number, string>>(filteredProduct);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const {
    data: listProductsSelect,
    isLoading: isLoadingSelect,
    isError: isErrorSelect,
  } = useGetProductsSelect(
    {
      search: debouncedQuery.trim(),
    },
    {
      enabled: openIdx !== null && debouncedQuery.trim().length >= 2,
    },
  );

  const addOptionToProductMutation = useAddOptionToProduct();

  useEffect(() => {
    setSelectedAction(filteredProduct);
    setLocalCombinations(combinations);
  }, [combinations, filteredProduct]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryParams);
    }, 350);
    return () => clearTimeout(timer);
  }, [queryParams]);

  const selectedProductsMap = useMemo(() => {
    const map = new Map<string, ProductItem>();
    (productDetails?.products ?? []).forEach((product) => {
      map.set(String(product.id ?? ""), product);
    });
    (listProductsSelect ?? []).forEach((product) => {
      map.set(String(product.id ?? ""), product);
    });
    return map;
  }, [listProductsSelect, productDetails?.products]);

  const handleDeleteCombination = (idx: number) => {
    setLocalCombinations((prev) => prev.filter((_, i) => i !== idx));
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
      <div className="text-right">
        <Button type="button" onClick={handleSaveGroup} className="mt-4">
          Save group
        </Button>
      </div>
      <h3 className="font-semibold mb-4">Variant list:</h3>
      <div className="space-y-6">
        {localCombinations
          .filter((comb) => comb.length > 0)
          .map((combination, idx) => (
            <div key={idx} className="flex group items-center">
              <div
                className="flex items-center justify-center shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteCombination(idx)}
              >
                <X size={20} className="text-red-500" />
              </div>

              <div className="grid grid-cols-3 gap-6 flex-1">
                {/* hiển thị các option */}
                <div className="flex items-center gap-2 col-span-1 justify-end relative ">
                  {combination.map((option, index) => (
                    <React.Fragment key={option.id ?? index}>
                      <div>
                        {option.image_url ? (
                          <Image
                            src={option.image_url}
                            alt={option.label}
                            width={30}
                            height={30}
                            className="w-12 h-12 object-contain rounded"
                            unoptimized
                          />
                        ) : (
                          <span className="border-2 rounded-sm py-1 px-2">
                            {option.label}
                          </span>
                        )}
                      </div>
                      {index < combination.length - 1 && (
                        <Plus size={20} className="text-black" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Combobox Popover */}
                <div className="col-span-2 flex gap-2 items-center">
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
                        variant="outline"
                        role="combobox"
                        className="flex-1 justify-between py-2 h-auto"
                      >
                        {(() => {
                          const selectedProduct = selectedProductsMap.get(
                            String(selectedAction[idx] ?? ""),
                          );

                          return (
                            <div className="flex gap-4">
                              {selectedAction[idx] ? (
                                <div className="flex gap-2 items-center">
                                  <Image
                                    src={
                                      selectedProduct?.static_files?.[0]?.url ??
                                      "/placeholder-product.webp"
                                    }
                                    width={40}
                                    height={40}
                                    alt=""
                                    className="h-10 rounded-sm"
                                    unoptimized
                                  />
                                  <div className="text-base text-wrap text-start">
                                    {selectedProduct?.name ??
                                      "Product selected"}
                                  </div>
                                  {selectedProduct?.url_key && (
                                    <Link
                                      href={`/de/product/${selectedProduct.url_key}`}
                                      locale={locale}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Eye
                                        className="text-secondary cursor-pointer"
                                        size={20}
                                      />
                                    </Link>
                                  )}
                                </div>
                              ) : (
                                "Select product"
                              )}
                            </div>
                          );
                        })()}
                        <ChevronRight />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[600px] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search product..."
                          value={queryParams}
                          onValueChange={(value) => setQueryParams(value)}
                        />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup className="h-[400px] overflow-y-scroll">
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
                            (listProductsSelect ?? [])
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
                                  onSelect={(value) => {
                                    setSelectedAction((prev) => ({
                                      ...prev,
                                      [idx]: value,
                                    }));
                                    setQueryParams("");
                                    setDebouncedQuery("");
                                    setOpenIdx(null); // 👉 đóng popover sau khi chọn
                                  }}
                                  className="flex w-full justify-between"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Image
                                      src={
                                        (product.static_files?.length ?? 0) > 0
                                          ? product.static_files[0].url
                                          : "/placeholder-product.webp"
                                      }
                                      height={25}
                                      width={25}
                                      alt=""
                                      className="rounded-"
                                      unoptimized
                                    />
                                    <span>{product.name}</span>
                                  </div>
                                  <span>#{product.id_provider}</span>
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
