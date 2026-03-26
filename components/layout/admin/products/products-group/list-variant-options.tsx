import { Loader2, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddOptionDialog from "./add-option-modal";
import {
  useDeleteVariant,
  useDeleteVariantOption,
} from "@/features/variant/hook";
import { useFormContext } from "react-hook-form";
import {
  filterProductsByCombinations,
  VariantCombinations,
} from "./list-combination-options";
import { VariantOptionResponse, VariantOptionsResponse } from "@/types/variant";
import { toast } from "sonner";
import { ProductGroupDetailResponse } from "@/types/product-group";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getProductGroupDetail } from "@/features/product-group/api";

const ListVariantOption = () => {
  const { watch } = useFormContext();
  const parent_id = watch("parent_id");
  const [selected, setSelected] = useState<
    Record<string, VariantOptionResponse[]>
  >({});
  const [openModalAddOption, setOpenModalAddOption] = useState<boolean>(false);
  const [combination, setCombination] = useState<VariantOptionResponse[][]>();

  const {
    data: groupDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-group-detail", parent_id],
    queryFn: () => getProductGroupDetail(parent_id),
    enabled: !!parent_id,
  });

  const deleteVariantMutation = useDeleteVariant();
  const deleteVariantOptionMutation = useDeleteVariantOption();

  const transformGroupDetailToSelected = (
    groupDetail: ProductGroupDetailResponse,
  ) => {
    const result: Record<string, VariantOptionResponse[]> = {};

    groupDetail.variants.forEach((variant: VariantOptionsResponse) => {
      result[variant.variant.id] = variant.options.map(
        (o: VariantOptionResponse) => ({
          id: o.id,
          label: o.label,
          image_url: o.image_url,
          img_description: o.img_description,
          is_global: o.is_global,
        }),
      );
    });

    return result;
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
      const combinations = generateVariantCombinations(selected);
      setCombination(combinations);
    }
  }, [parent_id, selected]);

  // const generateVariantCombinations = (selected: Record<string, VariantOptionResponse[]>) => {
  //     const variantIds = Object.keys(selected);

  //     if (variantIds.length === 0) return [];

  //     // Lấy danh sách options theo thứ tự variantIds
  //     const optionsList = variantIds.map(id => selected[id]);

  //     // Hàm Cartesian product
  //     const cartesian = (arrays: VariantOptionResponse[][]): VariantOptionResponse[][] => {
  //         return arrays.reduce<VariantOptionResponse[][]>(
  //             (acc, curr) =>
  //                 acc.flatMap(a => curr.map(c => [...a, c])),
  //             [[]]
  //         );
  //     };
  //     return cartesian(optionsList);
  // };

  const generateVariantCombinations = (
    selected: Record<string, VariantOptionResponse[]>,
  ) => {
    const variantIds = Object.keys(selected);

    if (variantIds.length === 0) return [];

    // Lấy danh sách options, bỏ qua variant không có option
    const optionsList = variantIds
      .map((id) => selected[id])
      .filter((options) => options.length > 0);

    if (optionsList.length === 0) return [];

    // Cartesian product
    const cartesian = (
      arrays: VariantOptionResponse[][],
    ): VariantOptionResponse[][] => {
      return arrays.reduce<VariantOptionResponse[][]>(
        (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
        [[]],
      );
    };

    return cartesian(optionsList);
  };

  const handleDeleteVariant = (variant_id: string) => {
    deleteVariantMutation.mutate(variant_id, {
      onSuccess() {
        toast.success("Delete variant successful");
      },
      onError() {
        toast.error("Delete variant fail");
      },
    });
  };

  const handleDeleteVariantOption = (option_id: string) => {
    deleteVariantOptionMutation.mutate(option_id, {
      onSuccess() {
        toast.success("Delete variant option successful");
      },
      onError() {
        toast.error("Delete variant option fail");
      },
    });
  };

  if (!groupDetail)
    return (
      <div className="text-red-500">You need to choose product group first</div>
    );
  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6">
      {isLoading || isError || !groupDetail ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      ) : (
        groupDetail.variants.map((variant) => (
          <div key={variant.variant.id} className="rounded-lg border p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">{variant.variant.name}:</p>
              <button
                type="button"
                className="shrink-0 text-gray-600 transition-colors hover:text-red-500"
                onClick={() => handleDeleteVariant(variant.variant.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {variant.options.map((o) => (
                <div key={o.id} className="relative inline-block group">
                  {o.image_url ? (
                    <Image
                      src={o.image_url}
                      width={40}
                      height={40}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="block rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {o.label}
                    </span>
                  )}

                  <button
                    type="button"
                    className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                    onClick={() => handleDeleteVariantOption(o.id)}
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              ))}

              <AddOptionDialog
                isImage={variant.variant.is_img}
                variantId={variant.variant.id}
                open={openModalAddOption}
                setOpen={setOpenModalAddOption}
              />
            </div>

            {variant.options.length === 0 && (
              <p className="mt-3 text-sm text-red-500">
                You need to add options for this attribute
              </p>
            )}
          </div>
        ))
      )}

      {!groupDetail ? (
        <div>
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <VariantCombinations
          combinations={combination ? combination : []}
          productDetails={groupDetail}
          filteredProduct={filterProductsByCombinations(
            groupDetail.products,
            combination ?? [],
          )}
        />
      )}
    </div>
  );
};

export default ListVariantOption;
