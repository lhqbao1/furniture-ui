import { ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { AddOptionToProductInput, ProductOptionData, VariantOptionResponse } from "@/types/variant";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { toast } from "sonner";
import { useAddOptionToProduct } from "@/features/variant/hook";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { NewProductItem, ProductItem, VariantOption } from "@/types/products";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface VariantCombinationsProps {
    combinations: VariantOptionResponse[][];
    productDetails: ProductGroupDetailResponse;
    filteredProduct: Record<number, string>
}

export function filterProductsByCombinations(
    products: NewProductItem[],
    combinations: VariantOptionResponse[][]
): Record<number, string> {
    const result: Record<number, string> = {}

    combinations.forEach((comb, index) => {
        const combIds = comb.map((o) => o.id).sort()

        const matchedProduct = products.find((product) => {
            const productOptionIds = product.options.map((o) => o.id).sort()
            return (
                combIds.length === productOptionIds.length &&
                combIds.every((id, idx) => id === productOptionIds[idx])
            )
        })

        if (matchedProduct) {
            result[index] = matchedProduct.id ?? ''
        }
    })

    return result
}

export const VariantCombinations: React.FC<VariantCombinationsProps> = ({
    combinations,
    filteredProduct
}) => {
    const { watch } = useFormContext();
    const parent_id = watch("parent_id") || "";
    const [queryParams, setQueryParams] = useState('')

    const [selectedAction, setSelectedAction] = useState<Record<number, string>>(filteredProduct);
    const [listSelect, setListSelect] = useState<NewProductItem[]>([])

    const { data: listProducts, isLoading, isError } = useGetProductsSelect();
    const { data: listProductsSelect, isLoading: isLoadingSelect, isError: isErrorSelect } = useGetProductsSelect(queryParams);

    const addOptionToProductMutation = useAddOptionToProduct();

    useEffect(() => {
        setSelectedAction(filteredProduct);
    }, [combinations, filteredProduct])

    useEffect(() => {
        setListSelect(listProductsSelect ?? [])
    }, [listProductsSelect])

    if (combinations.length === 0) return <p>No combinations selected</p>;

    const handleSaveGroup = () => {
        const data = combinations
            .map((combination, idx) => {
                return ({
                    options: combination.map((opt) => opt.id!) as string[],
                    product_id: selectedAction[idx],
                })
            })

        const filteredData: ProductOptionData[] = data.filter((data, idx) => data.product_id !== undefined)


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
        <div className="mt-6">
            <h3 className="font-semibold mb-2">Combinations:</h3>
            <div className="space-y-6">
                {combinations.map((combination, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-6">

                        {/* hiển thị các option */}
                        <div className="flex items-center gap-2 col-span-3">
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
                        <div className="col-span-9">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between py-1 h-12"
                                    >
                                        <div className="flex gap-4">
                                            {selectedAction[idx]
                                                ?
                                                <div className="flex gap-2 items-center">
                                                    <Image
                                                        src={listProducts?.find((p) => p.id === selectedAction[idx])?.static_files[0].url ?? '/1.png'}
                                                        width={40}
                                                        height={40}
                                                        alt=""
                                                        className="h-10"
                                                    />
                                                    <div className="text-base">{listProducts?.find((p) => p.id === selectedAction[idx])?.name}</div>
                                                </div>
                                                : "Select product"}
                                        </div>
                                        <ChevronRight />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[600px] p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search product..."
                                            value={queryParams}
                                            onValueChange={(value) => setQueryParams(value)} // cập nhật query
                                        />
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        <CommandGroup>
                                            {isLoading && <CommandItem disabled>Loading...</CommandItem>}
                                            {isError && <CommandItem disabled>Error loading products</CommandItem>}
                                            {listSelect
                                                .filter((product) =>
                                                    !Object.values(selectedAction).includes(product.id ?? "")
                                                )
                                                .map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.id ?? ""}
                                                        onSelect={(value) =>
                                                            setSelectedAction((prev) => ({ ...prev, [idx]: value }))
                                                        }
                                                        className="flex w-full justify-between"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <Image
                                                                src={
                                                                    product.static_files.length > 0
                                                                        ? product.static_files[0].url
                                                                        : "/1.png"
                                                                }
                                                                height={25}
                                                                width={25}
                                                                alt=""
                                                            />
                                                            <span>{product.name}</span>
                                                        </div>
                                                        <span>#{product.sku}</span>
                                                    </CommandItem>
                                                ))}

                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                ))}
            </div>
            <Button type="button" onClick={handleSaveGroup} className="mt-4">
                Save group
            </Button>
        </div>
    );
};

