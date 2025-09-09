import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Loader2, Plus, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import AddOptionDialog from "./add-option-modal"
import { useAddOptionToProduct, useCreateVariantOption, useGetVariantOptionByVariant } from "@/features/variant/hook"
import { useFormContext } from "react-hook-form"
import { filterProductsByCombinations, VariantCombinations } from "./list-combination-options"
import { useGetProductGroupDetail } from "@/features/product-group/hook"
import { VariantOptionInput, VariantOptionResponse, VariantOptionsResponse } from "@/types/variant"
import { toast } from "sonner"
import { ProductGroupDetailResponse } from "@/types/product-group"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { getProductGroupDetail } from "@/features/product-group/api"


const ListVariantOption = () => {
    const { watch } = useFormContext()
    const parent_id = watch('parent_id')
    const [selected, setSelected] = useState<Record<string, VariantOptionResponse[]>>({})
    const [openModalAddOption, setOpenModalAddOption] = useState<boolean>(false)
    const [combination, setCombination] = useState<VariantOptionResponse[][]>()
    const [currentVariant, setCurrentVariant] = useState<string | null>(null);

    const { data: groupDetail, isLoading, isError } = useQuery({
        queryKey: ["product-group-detail", parent_id],
        queryFn: () => getProductGroupDetail(parent_id),
        enabled: !!parent_id,
    })
    const { data: variantOption, isLoading: isLoadingOption, isError: isErrorOption } = useGetVariantOptionByVariant(currentVariant ?? '')

    const createVariantOptionMutation = useCreateVariantOption()

    const transformGroupDetailToSelected = (groupDetail: ProductGroupDetailResponse) => {
        const result: Record<string, VariantOptionResponse[]> = {};

        groupDetail.variants.forEach((variant: VariantOptionsResponse) => {
            result[variant.variant.id] = variant.options.map((o: VariantOptionResponse) => ({
                id: o.id,
                label: o.label,
                image_url: o.image_url,
            }));
        });

        return result;
    };

    const handleSaveVariantOption = () => {
        const combinations = generateVariantCombinations(selected);
        setCombination(combinations)
    };

    useEffect(() => {
        if (!parent_id) return;

        // reset khi đổi parent
        setCombination([]);
        setSelected({});

        if (groupDetail?.variants) {
            setSelected(transformGroupDetailToSelected(groupDetail));
        }
    }, [parent_id, groupDetail]);

    useEffect(() => {
        if (parent_id) {
            handleSaveVariantOption();
        }
    }, [parent_id, selected]);



    const generateVariantCombinations = (selected: Record<string, VariantOptionResponse[]>) => {
        const variantIds = Object.keys(selected);

        if (variantIds.length === 0) return [];

        // Lấy danh sách options theo thứ tự variantIds
        const optionsList = variantIds.map(id => selected[id]);

        // Hàm Cartesian product
        const cartesian = (arrays: VariantOptionResponse[][]): VariantOptionResponse[][] => {
            return arrays.reduce<VariantOptionResponse[][]>(
                (acc, curr) =>
                    acc.flatMap(a => curr.map(c => [...a, c])),
                [[]]
            );
        };
        return cartesian(optionsList);
    };

    const handleAddVariantOption = (variant_id: string, input: { label: string, image_url?: string | null }) => {
        // Convert sang VariantOptionInput
        const payload: VariantOptionInput = {
            options: [input],
        };

        createVariantOptionMutation.mutate({ variant_id, input: payload }, {
            onSuccess() {
                toast.success("Option added successfully");
            },
            onError(error) {
                toast.error("Failed to add option");
                console.error(error);
            }
        });
    }

    if (!groupDetail) return <div className="text-red-500">You need to choose product group first</div>
    if (isLoading) return <Loader2 className="animate-spin" />

    return (
        <div className="space-y-6">
            {isLoading || isError || !groupDetail ? (
                <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
            ) : (groupDetail.variants.map((variant, index) => (
                <div key={variant.variant.id} className="flex gap-2 justify-start">
                    <div className="flex items-center"><X size={18} className="text-red-500 cursor-pointer" /></div>
                    <div className="grid grid-cols-6 w-full gap-8">
                        <p className="col-span-1 flex items-center justify-end">
                            {variant.variant.name}:
                        </p>
                        <div className="font-semibold col-span-5 flex gap-4 items-center">
                            {/* Hiển thị đã chọn */}
                            <div className="flex gap-2">
                                {variant.options.map((o) => {
                                    if (o.image_url) {
                                        return (
                                            <Image
                                                src={o.image_url}
                                                width={20}
                                                height={20}
                                                alt=""
                                                key={o.id}
                                            />
                                        )
                                    } else {
                                        return (
                                            <span
                                                key={o.id}
                                                className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
                                            >
                                                <div>{o.label}</div>
                                            </span>
                                        )
                                    }
                                })}
                            </div>

                            <AddOptionDialog variantId={variant.variant.id} open={openModalAddOption} setOpen={setOpenModalAddOption} />

                            <DropdownMenu
                                key={variant.variant.id}
                                open={currentVariant === variant.variant.name}
                                onOpenChange={(open) => setCurrentVariant(open ? variant.variant.name : null)}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" type="button">
                                        Select
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-40">
                                    {currentVariant === variant.variant.name && isLoading && (
                                        <div className="px-3 py-2 text-sm">Loading...</div>
                                    )}

                                    {currentVariant === variant.variant.name &&
                                        variantOption?.map((option, index) => (
                                            <DropdownMenuCheckboxItem
                                                key={option.label + index}
                                                checked={false}
                                                onCheckedChange={() => {
                                                    handleAddVariantOption(variant.variant.id, option)
                                                }}
                                            >
                                                {option.image_url ?
                                                    <Image
                                                        src={option.image_url}
                                                        width={40}
                                                        height={40}
                                                        alt=""
                                                    />
                                                    : <div>{option.label}</div>
                                                }
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            )))
            }

            {!groupDetail ?
                (<div><Loader2 className="animate-spin" /></div>)
                :
                (
                    <VariantCombinations
                        combinations={combination ? combination : []}
                        productDetails={groupDetail}
                        filteredProduct={filterProductsByCombinations(
                            groupDetail.products,
                            combination ?? []
                        )}
                    />
                )}

        </div>
    )
}

export default ListVariantOption
