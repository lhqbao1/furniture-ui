"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAddToCartHandler } from "@/hooks/single-product/useAddToCartHandler";
import { cartFormSchema } from "@/lib/schema/cart";
import { ProductItem } from "@/types/products";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import ListVariant from "../list-variant";
import { useQuery } from "@tanstack/react-query";
import { getProductGroupDetail } from "@/features/product-group/api";
import ListVariantSkeleton from "../skeleton/list-variant-skeleton";
import { FormQuantityInput } from "./quantity-input";
import MobileStickyCart from "../sticky-cart-mobile";
import { useInventoryPoByProductId } from "@/features/incoming-inventory/inventory/hook";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { calculateIncomingStockSummary } from "@/hooks/calculate_incoming_stock";
import PostAddToCartDrawer from "./post-add-to-cart-drawer";
import { toast } from "sonner";

interface AddToCartFieldProps {
  productId: string;
  productDetails: ProductItem;
}

const AddToCartField = ({ productId, productDetails }: AddToCartFieldProps) => {
  const t = useTranslations();
  const [isPostAddDrawerOpen, setIsPostAddDrawerOpen] = React.useState(false);
  const [lastAddedQuantity, setLastAddedQuantity] = React.useState(1);

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

  const { data: inventoryPo } = useInventoryPoByProductId(productDetails.id);

  const incomingInventorySource = useMemo<ProductItem["inventory_pos"]>(() => {
    if (Array.isArray(inventoryPo) && inventoryPo.length > 0) {
      return inventoryPo as ProductItem["inventory_pos"];
    }

    return productDetails.inventory_pos ?? [];
  }, [inventoryPo, productDetails.inventory_pos]);

  const productForCart = useMemo<ProductItem>(
    () => ({
      ...productDetails,
      inventory_pos: incomingInventorySource,
    }),
    [incomingInventorySource, productDetails],
  );

  const { handleSubmitToCart, handleAddWishlist } =
    useAddToCartHandler(productForCart);

  const incomingSummary = useMemo(
    () =>
      calculateIncomingStockSummary(productForCart, {
        inventoryPo: incomingInventorySource,
      }),
    [incomingInventorySource, productForCart],
  );

  const incomingStock = incomingSummary.incomingStock;

  const maxStock = useMemo(() => {
    const baseStock = calculateAvailableStock(productForCart);
    return Math.max(0, baseStock + incomingStock);
  }, [productForCart, incomingStock]);

  const isPurchasableByStock = useMemo(
    () => Boolean(productForCart.is_active) && maxStock > 0,
    [maxStock, productForCart.is_active],
  );

  const hasValidFinalPrice = useMemo(() => {
    const finalPrice = Number(productDetails.final_price);
    return Number.isFinite(finalPrice) && finalPrice > 0;
  }, [productDetails.final_price]);

  const canAddToCart = hasValidFinalPrice && isPurchasableByStock;

  const handleSubmitWithStockCheck = React.useCallback(
    (
      values: z.infer<typeof cartFormSchema>,
      options?: { openDrawer?: boolean; onSuccess?: () => void },
    ) => {
      if (!productForCart.is_active) {
        toast.error(t("outStock"));
        return;
      }

      if (!hasValidFinalPrice) {
        toast.error(t("addToCartFail"));
        return;
      }

      const quantity = Number(values.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error(t("addToCartFail"));
        return;
      }

      if (!isPurchasableByStock) {
        toast.error(t("outStock"));
        return;
      }

      if (quantity > maxStock) {
        toast.error(t("notEnoughStock"));
        return;
      }

      handleSubmitToCart({ ...values, quantity }, {
        onSuccess: () => {
          const isDesktop =
            typeof window !== "undefined" ? window.innerWidth >= 768 : true;

          if (options?.openDrawer && isDesktop) {
            setLastAddedQuantity(quantity);
            setIsPostAddDrawerOpen(true);
          }
          options?.onSuccess?.();
        },
      });
    },
    [
      handleSubmitToCart,
      hasValidFinalPrice,
      isPurchasableByStock,
      maxStock,
      productForCart.is_active,
      t,
    ],
  );

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) =>
              handleSubmitWithStockCheck(values, { openDrawer: true }),
            (e) => console.error("Please check the form for errors", e),
          )}
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
          <div className="md:flex flex-row items-start gap-4 mt-6 hidden">
            <div className="lg:basis-1/4 basis-2/5 space-y-2">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormQuantityInput
                        value={field.value ?? 1}
                        onChange={field.onChange}
                        min={1}
                        max={maxStock}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 lg:basis-2/5 basis-3/5 relative flex gap-2">
              {canAddToCart ? (
                <Button
                  className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base lg:min-h-[40px] lg:h-fit !h-[40px] w-full"
                  type="submit"

                  // disabled={productDetails.stock > 0 ? false : true}
                >
                  {/* {productDetails.stock > 0 ? t("addToCart") : t("outStock")} */}
                  {t("addToCart")}
                </Button>
              ) : (
                <Button
                  className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base w-full lg:min-h-[40px] lg:h-fit !h-[40px] bg-gray-500 text-white cursor-not-allowed"
                  type="submit"
                  disabled
                  // disabled={productDetails.stock > 0 ? false : true}
                >
                  {/* {productDetails.stock > 0 ? t("addToCart") : t("outStock")} */}
                  {t("addToCart")}
                </Button>
              )}

              <div className="flex justify-end">
                <div
                  onClick={() => {
                    handleAddWishlist();
                  }}
                  className="bg-white rounded-md aspect-square text-gray-500 cursor-pointer font-bold flex items-center justify-center hover:text-white transition-all duration-300 hover:bg-secondary g:min-h-[40px] lg:h-fit !h-[40px]"
                >
                  <Heart />
                </div>
              </div>
            </div>
          </div>

          <MobileStickyCart
            onAddToCart={(cb) =>
              form.handleSubmit((values) => {
                handleSubmitWithStockCheck(values, {
                  openDrawer: false,
                  onSuccess: cb?.onSuccess,
                });
              })()
            }
            price={productDetails.final_price}
            oldPrice={productDetails.price}
            maxStock={hasValidFinalPrice ? maxStock : 0}
            canAddToCart={canAddToCart}
          />
        </form>
      </FormProvider>
      <PostAddToCartDrawer
        open={isPostAddDrawerOpen}
        onOpenChange={setIsPostAddDrawerOpen}
        product={productForCart}
        quantity={lastAddedQuantity}
      />
    </>
  );
};

export default AddToCartField;
