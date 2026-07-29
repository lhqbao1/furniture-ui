"use client";

import { CartFormValues } from "@/lib/schema/cart";
import { slugify } from "@/lib/slugify";
import { useRouter } from "@/src/i18n/navigation";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { ProductItem } from "@/types/products";
import { VariantOptionsResponse } from "@/types/variant";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ListVariantProps {
  variant: VariantOptionsResponse[];
  currentProduct: ProductItem;
  parentProduct: ProductGroupDetailResponse;
}

const ListVariant = ({
  variant,
  currentProduct,
  parentProduct,
}: ListVariantProps) => {
  const { control, setValue } = useFormContext<CartFormValues>();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const router = useRouter();
  const locale = useLocale();
  const normalizeId = (value: unknown) => String(value ?? "");
  const getProductSlug = (product: ProductItem) => {
    const urlKey = product.url_key?.trim();
    if (urlKey) return urlKey;

    const productName = product.name?.trim();
    const idProvider = product.id_provider?.trim();

    if (productName && idProvider) {
      return `${slugify(productName)}-${idProvider}`;
    }

    return "";
  };

  useEffect(() => {
    if (!currentProduct?.options?.length) return;

    const ids = currentProduct.options.map((o) => normalizeId(o.id));

    setSelectedOptions(ids);

    const timer = setTimeout(() => {
      setValue("option_id", ids, { shouldValidate: false });
    }, 0);

    return () => clearTimeout(timer);
  }, [currentProduct, setValue]);

  const handleSelect = (variantId: string, optionId: string) => {
    if (!parentProduct) return;
    const normalizedVariantId = normalizeId(variantId);
    const normalizedOptionId = normalizeId(optionId);

    const nextSelectedOptions = (() => {
      const otherOptions = selectedOptions.filter((id) => {
        const isSameVariant = variant.some(
          (g) =>
            normalizeId(g.variant.id) === normalizedVariantId &&
            g.options.some((o) => normalizeId(o.id) === normalizeId(id)),
        );
        return !isSameVariant;
      });
      return [...otherOptions, normalizedOptionId];
    })();

    setSelectedOptions(nextSelectedOptions);

    const matchedProduct = parentProduct.products.find((product) => {
      const optionIds =
        product.options?.map((opt) => normalizeId(opt.id)) ?? [];
      return (
        optionIds.length === nextSelectedOptions.length &&
        nextSelectedOptions.every((id) => optionIds.includes(normalizeId(id)))
      );
    });

    const matchedProductSlug = matchedProduct
      ? getProductSlug(matchedProduct)
      : "";

    if (matchedProductSlug) {
      setTimeout(() => {
        router.push(`/product/${matchedProductSlug}`, { locale });
      }, 0);
      return;
    }
  };

  useEffect(() => {
    setValue("option_id", selectedOptions, { shouldValidate: false });
  }, [selectedOptions, setValue]);

  const validOptionIds = useMemo(() => {
    return new Set(
      parentProduct.products?.flatMap(
        (p) => p.options?.map((o) => normalizeId(o.id)) ?? [],
      ),
    );
  }, [parentProduct]);

  return (
    <Controller
      control={control}
      name="option_id"
      render={() => (
        <div className="flex flex-col gap-4">
          {variant.map((group) => (
            <div key={group.variant.id} className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">
                {group.variant.name}
              </span>

              <div className="flex gap-2 flex-wrap">
                {group.options.map((option) => {
                  const optionId = normalizeId(option.id);
                  const isSelected = selectedOptions.includes(optionId);
                  const isValid = validOptionIds.has(optionId);

                  return (
                    <div
                      key={option.id}
                      className={`
                      cursor-pointer 
                      ${
                        isSelected
                          ? "border-2 border-primary rounded-sm"
                          : "border border-gray-300 rounded-sm"
                      } 
                      ${
                        !isValid
                          ? "opacity-40 cursor-not-allowed pointer-events-none"
                          : ""
                      }
                    `}
                      onClick={() => {
                        if (!isValid) return; // ❌ không cho click option invalid
                        handleSelect(
                          normalizeId(group.variant.id),
                          normalizeId(option.id),
                        );
                      }}
                    >
                      {option.image_url ? (
                        <div className="shadow-sm bg-white rounded-sm border border-gray-300 p-2">
                          <Image
                            src={option.image_url}
                            width={50}
                            height={50}
                            alt={option.label || group.variant.name}
                            unoptimized
                          />
                          {option.img_description}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-md text-sm font-semibold">
                          {option.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
};

export default ListVariant;
