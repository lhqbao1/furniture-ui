"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAddToCartHandler } from "@/hooks/single-product/useAddToCartHandler";
import { cartFormSchema } from "@/lib/schema/cart";
import { ProductItem } from "@/types/products";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { FormNumberInput } from "../form-number.input";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import ListVariant from "../list-variant";
import { useQuery } from "@tanstack/react-query";
import { getProductGroupDetail } from "@/features/product-group/api";
import ListVariantSkeleton from "../skeleton/list-variant-skeleton";
import { Input } from "@/components/ui/input";
import { FormQuantityInput } from "./quantity-input";
import MobileStickyCart from "../sticky-cart-mobile";
import { getTotalIncomingStock } from "@/lib/calculate-inventory";

interface AddToCartFieldProps {
  productId: string;
  productDetails: ProductItem;
}

const AddToCartField = ({ productId, productDetails }: AddToCartFieldProps) => {
  const t = useTranslations();
  // Form setup
  const form = useForm<z.infer<typeof cartFormSchema>>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: {
      productId: productId,
      option_id: [],
      quantity: 1,
      is_active: false,
    },
  });

  const { data: parentProduct, isLoading: isLoadingParent } = useQuery({
    queryKey: ["product-group-detail", productDetails.parent_id],
    queryFn: () => getProductGroupDetail(productDetails.parent_id ?? ""),
    enabled: !!productDetails.parent_id,
    // initialData: productDe,
  });

  const { handleSubmitToCart, handleAddWishlist } =
    useAddToCartHandler(productDetails);

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => handleSubmitToCart(values),
            (e) => console.error("Please check the form for errors", e),
          )}
          className="space-y-8"
        >
          {
            isLoadingParent ? (
              // chỉ khi đang loading mới skeleton
              <ListVariantSkeleton />
            ) : parentProduct && parentProduct.variants?.length > 0 ? (
              // load xong và có data
              <ListVariant
                variant={parentProduct.variants}
                currentProduct={productDetails}
                parentProduct={parentProduct}
              />
            ) : null // hoặc render message "Không có phiên bản"
          }
          <div className="flex  flex-row items-end gap-4">
            <div className="lg:basis-1/4 basis-2/5">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("quantity")}</FormLabel>
                    <FormControl>
                      <FormQuantityInput
                        value={field.value ?? 1}
                        onChange={field.onChange}
                        min={1}
                        max={productDetails.stock || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-1 lg:basis-2/5 basis-3/5 relative">
              {productDetails.stock > 0 ||
              (productDetails.stock === 0 &&
                getTotalIncomingStock(productDetails.inventory) > 0) ? (
                <Button
                  className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base lg:min-h-[40px] lg:h-fit !h-[40px]"
                  type="submit"

                  // disabled={productDetails.stock > 0 ? false : true}
                >
                  {/* {productDetails.stock > 0 ? t("addToCart") : t("outStock")} */}
                  {t("addToCart")}
                </Button>
              ) : (
                <Button
                  className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base lg:min-h-[40px] lg:h-fit !h-[40px] bg-gray-500 text-white cursor-not-allowed"
                  type="submit"
                  disabled
                  // disabled={productDetails.stock > 0 ? false : true}
                >
                  {/* {productDetails.stock > 0 ? t("addToCart") : t("outStock")} */}
                  {t("addToCart")}
                </Button>
              )}

              <div
                onClick={(e) => {
                  handleAddWishlist();
                }}
                className="bg-white rounded-md aspect-square text-gray-500 cursor-pointer font-bold flex items-center justify-center hover:text-white border-secondary border  hover:bg-secondary g:min-h-[40px] lg:h-fit !h-[40px]"
              >
                <Heart />
              </div>
            </div>
          </div>

          <MobileStickyCart
            onAddToCart={() =>
              form.handleSubmit((values) => {
                handleSubmitToCart(values);
              })()
            }
            price={productDetails.final_price}
            oldPrice={productDetails.price}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default AddToCartField;
