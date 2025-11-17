"use client";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eye, Heart } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { ProductDetailsTab } from "@/components/layout/single-product/product-tab";
import ListStars from "@/components/shared/list-stars";
import ProductDetailsSkeleton from "@/components/layout/single-product/product-detail-skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { cartFormSchema } from "@/lib/schema/cart";
import z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ListVariant from "@/components/layout/single-product/list-variant";
import { FormNumberInput } from "@/components/layout/single-product/form-number.input";
import { ProductItem } from "@/types/products";
import { useLocale, useTranslations } from "next-intl";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { useRouter } from "@/src/i18n/navigation";

import { useProductData } from "@/hooks/single-product/useProductData";
import { useAddToCartHandler } from "@/hooks/single-product/useAddToCartHandler";
import { useImageZoom } from "@/hooks/single-product/useImageZoom";
import { useSwipeImage } from "@/hooks/single-product/useSwipeImage";
import MainImage from "./image/main-image";
import ImageGallery from "./image/image-carousel";
import ProductDetailsLogistic from "./details/logistics";
import ProductDetailsPrice from "./details/price";
import { ReviewResponse } from "@/types/review";

interface ProductDetailsProps {
  productDetailsData: ProductItem;
  productId: string;
  parentProductData: ProductGroupDetailResponse | null;
  reviews: ReviewResponse[];
}

const ProductDetails = ({
  productDetailsData,
  productId,
  parentProductData,
  reviews,
}: ProductDetailsProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [adminId, setAdminId] = React.useState<string | null>(null);

  // ⭐ HOOK: fetch product + parent
  const { productDetails, parentProduct, isLoadingProduct } = useProductData(
    productDetailsData,
    parentProductData,
    productId,
  );

  // ⭐ HOOK: add to cart, wishlist
  const { handleSubmitToCart, handleAddWishlist } =
    useAddToCartHandler(productDetails);

  // ⭐ HOOK: zoom
  const {
    mainImageIndex,
    setMainImageIndex,
    position,
    isHover,
    setIsHover,
    handleZoomImage,
  } = useImageZoom();

  // ⭐ HOOK: swipe image
  const handlers = useSwipeImage(productDetails, setMainImageIndex);

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

  if (isLoadingProduct || !productDetails) return <ProductDetailsSkeleton />;

  useEffect(() => {
    setAdminId(localStorage.getItem("admin_access_token"));
  }, []);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, r) => total + (r.rating || 0), 0);
    return Number((sum / reviews.length).toFixed(1)); // giữ dạng number
  }, [reviews]);
  return (
    <>
      <div className="py-3 lg:pt-3 space-y-4">
        <CustomBreadCrumb
          isProductPage
          currentPage={
            productDetails?.categories[0]?.children?.length
              ? productDetails.categories[0].children[0].name
              : productDetails?.categories[0]?.name
          }
          currentPageLink={
            productDetails?.categories[0]?.children?.length
              ? `category/${productDetails.categories[0].children[0].slug}`
              : `category/${productDetails?.categories[0]?.slug}`
          }
        />
        {!isLoadingProduct && productDetails ? (
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(
                (values) => handleSubmitToCart(values),
                (e) => console.error("Please check the form for errors", e),
              )}
              className="space-y-8 lg:px-30"
            >
              <div className="flex flex-col gap-8">
                {/*Product details */}
                <div className="grid grid-cols-12 xl:gap-16 gap-8">
                  {/* LEFT — IMAGE */}
                  <div className="xl:col-span-6 col-span-12 flex flex-col gap-6 lg:gap-12">
                    <MainImage
                      productDetails={productDetails}
                      mainImageIndex={mainImageIndex}
                      setMainImageIndex={setMainImageIndex}
                      position={position}
                      isHover={isHover}
                      setIsHover={setIsHover}
                      handleZoomImage={handleZoomImage}
                      handlers={handlers}
                    />

                    <ImageGallery
                      productDetails={productDetails}
                      mainImageIndex={mainImageIndex}
                      setMainImageIndex={setMainImageIndex}
                    />
                  </div>

                  {/*Product details */}
                  <div className="xl:col-span-6 col-span-12 flex flex-col gap-6">
                    {adminId && (
                      <div
                        className="cursor-pointer text-primary"
                        onClick={() =>
                          router.push(`/admin/products/${productId}/edit`, {
                            locale,
                          })
                        }
                      >
                        <Eye />
                      </div>
                    )}
                    <div>
                      <h2 className="lg:text-3xl text-xl font-semibold text-black/70">
                        {productDetails.name}
                      </h2>
                      <div>
                        {t("itemNumber")}: {productDetails.id_provider}
                      </div>
                    </div>
                    <div className="hidden">EAN: {productDetails.ean}</div>
                    {reviews && reviews.length > 0 && (
                      <div className="flex flex-row justify-start gap-4 items-center">
                        <div className="flex gap-1 items-center">
                          <ListStars rating={avgRating} />
                        </div>
                      </div>
                    )}

                    <ProductDetailsPrice productDetails={productDetails} />

                    <ProductDetailsLogistic productDetails={productDetails} />

                    {parentProduct && parentProduct?.variants?.length > 0 && (
                      <ListVariant
                        variant={parentProduct.variants}
                        currentProduct={productDetails}
                        parentProduct={parentProduct}
                      />
                    )}

                    <div className="flex  flex-row items-end gap-4">
                      <div className="lg:basis-1/4 basis-2/5">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("quantity")}</FormLabel>
                              <FormControl>
                                <FormNumberInput
                                  {...field}
                                  min={productDetails.stock === 0 ? 0 : 1}
                                  max={productDetails.stock}
                                  stepper={1}
                                  placeholder={
                                    productDetails.stock === 0 ? "0" : "1"
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-1 lg:basis-2/5 basis-3/5 relative">
                        <Button
                          className="rounded-md font-bold flex-1 lg:px-12 mr-1 text-center justify-center lg:text-lg text-base lg:min-h-[40px] lg:h-fit !h-[40px]"
                          type="submit"
                          disabled={productDetails.stock > 0 ? false : true}
                        >
                          {productDetails.stock > 0
                            ? t("addToCart")
                            : t("outStock")}
                        </Button>

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
                  </div>
                </div>

                {/*Product tabs */}
                <div className="lg:mt-12 mt-8">
                  <ProductDetailsTab
                    reviews={reviews}
                    product={productDetails}
                  />
                </div>
              </div>
            </form>
          </FormProvider>
        ) : (
          <ProductDetailsSkeleton />
        )}
      </div>
    </>
  );
};

export default ProductDetails;
