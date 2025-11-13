"use client";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Heart, Info, Truck } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";
import ListVariant from "@/components/layout/single-product/list-variant";
import { FormNumberInput } from "@/components/layout/single-product/form-number.input";
import { useAddToCart } from "@/features/cart/hook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/features/products/api";
import { VariantOptionResponse } from "@/types/variant";
import { ProductItem } from "@/types/products";
import { useAddToWishList } from "@/features/wishlist/hook";
import { useLocale, useTranslations } from "next-intl";
import { HandleApiError } from "@/lib/api-helper";
import { useCartLocal } from "@/hooks/cart";
import { useSwipeable } from "react-swipeable";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { getProductGroupDetail } from "@/features/product-group/api";
import ProductImageDialog from "./main-image-dialog";
import { CartItemLocal } from "@/lib/utils/cart";
import { useRouter } from "@/src/i18n/navigation";
import Script from "next/script";
import { ProductImageCarousel } from "./sub-images-carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
interface ProductDetailsProps {
  productDetailsData: ProductItem;
  productId: string;
  parentProductData: ProductGroupDetailResponse | null;
}

const ProductDetails = ({
  productDetailsData,
  productId,
  parentProductData,
}: ProductDetailsProps) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const t = useTranslations();
  const { addToCartLocal, cart } = useCartLocal();
  const router = useRouter();
  const locale = useLocale();

  // Form init
  const form = useForm<z.infer<typeof cartFormSchema>>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: {
      productId: "",
      option_id: [],
      quantity: 1,
      is_active: false,
    },
  });

  const { data: productDetails, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    initialData: productDetailsData,
  });

  const { data: parentProduct, isLoading: isLoadingParent } = useQuery({
    queryKey: ["product-group-detail", productDetailsData.parent_id],
    queryFn: () => getProductGroupDetail(productDetailsData.parent_id ?? ""),
    enabled: !!productDetailsData.parent_id,
    initialData: parentProductData,
  });

  // Khi có productDetails mới → sync form
  useEffect(() => {
    if (productDetails?.id) {
      form.setValue("productId", productDetails.id);
      form.setValue(
        "option_id",
        productDetails.options.map((o: VariantOptionResponse) => o.id) // auto select option mặc định
      );
    }
  }, [productDetails, form]);

  // Add to cart mutation
  const createCartMutation = useAddToCart();
  //Add to wishlist mutation
  const addProductToWishlistMutation = useAddToWishList();

  const handleAddProductToWishlist = () => {
    addProductToWishlistMutation.mutate(
      { productId: productDetails?.id ?? "", quantity: 1 },
      {
        onSuccess: () => {
          toast.success(t("addToWishlistSuccess"));
        },
        onError: (error) => {
          const { status, message } = HandleApiError(error, t);
          toast.error(message);
        },
      }
    );
  };

  const handleSubmit = (values: z.infer<typeof cartFormSchema>) => {
    if (!productDetails) return;
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const existingItem = cart.find(
        (item: CartItemLocal) => item.product_id === productDetails.id
      );
      const totalQuantity = (existingItem?.quantity || 0) + values.quantity;

      if (totalQuantity > productDetails.stock) {
        toast.error(t("notEnoughStock"));
        return;
      }
      addToCartLocal(
        {
          item: {
            product_id: productDetails.id ?? "",
            quantity: values.quantity,
            is_active: true,
            item_price: productDetails.final_price,
            final_price: productDetails.final_price,
            img_url:
              productDetails.static_files.length > 0
                ? productDetails.static_files[0].url
                : "",
            product_name: productDetails.name,
            stock: productDetails.stock,
            carrier: productDetails.carrier ? productDetails.carrier : "amm",
            id_provider: productDetails.id_provider
              ? productDetails.id_provider
              : "",
            delivery_time: productDetails.delivery_time
              ? productDetails.delivery_time
              : "",
          },
        },
        {
          onSuccess(data, variables, context) {
            toast.success(t("addToCartSuccess"));
          },
          onError(error, variables, context) {
            toast.error(t("addToCartFail"));
          },
        }
      );
    } else {
      createCartMutation.mutate(
        { productId: productDetails?.id ?? "", quantity: values.quantity },
        {
          onSuccess(data, variables, context) {
            toast.success(t("addToCartSuccess"));
          },
          onError(error, variables, context) {
            const { status, message } = HandleApiError(error, t);
            if (status === 400) {
              toast.error(t("notEnoughStock"));
              return;
            }
            toast.error(message);
            if (status === 401) router.push("/login", { locale });
          },
        }
      );
    }
  };

  // Image zoom
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const handleZoomImage = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setPosition({ x, y });
  };

  const adminId =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_access_token")
      : null;

  const moveToAdmin = (productId: string) => {
    if (adminId) {
      router.push(`/admin/products/${productId}/edit`, { locale });
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!productDetails?.static_files?.length) return;
      setMainImageIndex(
        (prev) => (prev + 1) % productDetails.static_files.length
      );
    },
    onSwipedRight: () => {
      if (!productDetails?.static_files?.length) return;
      setMainImageIndex((prev) =>
        prev === 0 ? productDetails.static_files.length - 1 : prev - 1
      );
    },
    trackTouch: true,
  });

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
                (values) => handleSubmit(values),
                (e) => console.error("Please check the form for errors", e)
              )}
              className="space-y-8 lg:px-30"
            >
              <div className="flex flex-col gap-8">
                {/*Product details */}
                <div className="grid grid-cols-12 xl:gap-16 gap-8">
                  {/*Product details images */}
                  <div className="xl:col-span-6 col-span-12 flex flex-col gap-6 h-fit">
                    {/* Main image */}
                    <ProductImageDialog productDetails={productDetails}>
                      <div
                        className="flex justify-center overflow-hidden main-image"
                        onMouseMove={handleZoomImage}
                        onMouseEnter={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        {...handlers}
                      >
                        <Image
                          src={
                            productDetails.static_files.length > 0
                              ? productDetails.static_files[mainImageIndex].url
                              : "/placeholder-product.webp"
                          }
                          width={500}
                          height={300}
                          alt={`${productDetails.name}`}
                          className="transition-transform duration-300 lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer"
                          style={{
                            transformOrigin: `${position.x}% ${position.y}%`,
                            transform: isHover ? "scale(1.5)" : "scale(1)",
                          }}
                          priority
                        />
                      </div>
                    </ProductImageDialog>

                    {/* Sub images */}
                    <ProductImageCarousel
                      productDetails={productDetails}
                      mainImageIndex={mainImageIndex}
                      setMainImageIndex={setMainImageIndex}
                    />
                  </div>

                  {/*Product details */}
                  <div className="xl:col-span-6 col-span-12 flex flex-col gap-6">
                    {adminId ? (
                      <div
                        className="cursor-pointer text-primary"
                        onClick={() => moveToAdmin(productDetails.id)}
                      >
                        <Eye />
                      </div>
                    ) : (
                      ""
                    )}
                    <div>
                      <h2 className="lg:text-3xl text-xl font-semibold text-black/70">
                        {productDetails.name}
                      </h2>
                      <div>Artikelnummer: {productDetails.id_provider}</div>
                    </div>
                    <div className="hidden">EAN: {productDetails.ean}</div>
                    <div className="flex flex-row justify-start gap-4 items-center">
                      <div className="flex gap-1 items-center">
                        <ListStars rating={0} />
                      </div>
                    </div>
                    {/* <div className='flex gap-2'>
                                        <p className='text-primary lg:text-3xl text-xl font-semibold'>{productDetails.final_price ? <>€{productDetails.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</> : ''}</p>
                                        <p className='text-gray-300 line-through lg:text-3xl text-xl font-semibold'>{productDetails.price ? <>€{productDetails.price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</> : ''}</p>
                                    </div> */}
                    <div className="space-y-2">
                      <div className="inline-flex items-end justify-start w-fit gap-6 font-bold text-gray-900 relative">
                        <div className="text-4xl">
                          {Math.floor(
                            productDetails.final_price
                              ? productDetails.final_price
                              : productDetails.price
                          )}
                        </div>
                        <div className="text-base font-bold text-gray-700 absolute top-0 right-2.5">
                          ,
                          {
                            (
                              (productDetails.final_price
                                ? productDetails.final_price
                                : productDetails.price) % 1
                            )
                              .toFixed(2)
                              .split(".")[1]
                          }
                        </div>
                        <div className="text-base font-semibold text-black">
                          €
                        </div>
                      </div>

                      {productDetails.price &&
                        productDetails.price > productDetails.final_price && (
                          <p className="text-base mb-1">
                            Vorher: €
                            {productDetails.price.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                      {/* <div>{t("includeVatAndShipping")}</div> */}
                      <div className="flex gap-2 py-0 lg:py-3 items-center ">
                        <div>{t("inStock")}:</div>
                        <div className="grid grid-cols-3 w-1/3 gap-1">
                          <span
                            className={`w-full h-2 rounded-xs ${
                              productDetails.stock === 0
                                ? "bg-gray-300"
                                : productDetails.stock < 10
                                ? "bg-red-500"
                                : productDetails.stock <= 20
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          />

                          <span
                            className={`w-full h-2 rounded-xs ${
                              productDetails.stock === 0
                                ? "bg-gray-300"
                                : productDetails.stock < 10
                                ? "bg-gray-300"
                                : productDetails.stock <= 20
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          />

                          <span
                            className={`w-full h-2 rounded-xs ${
                              productDetails.stock === 0
                                ? "bg-gray-300"
                                : productDetails.stock < 10
                                ? "bg-gray-300"
                                : productDetails.stock <= 20
                                ? "bg-gray-400"
                                : "bg-secondary"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-row gap-4 items-start py-1.5 lg:py-3">
                        <Truck size={30} />
                        <div>
                          <p className="font-bold">
                            {t("shippingCost", {
                              shippingCost:
                                productDetails.carrier === "amm"
                                  ? "35,95€"
                                  : "5,95€",
                            })}
                          </p>
                          <p className="text-gray-500">14-Tage-Rückgaberecht</p>
                        </div>
                      </div>

                      <div className="flex flex-row gap-4 items-start  py-1.5 lg:py-3">
                        <Clock size={30} />
                        <div>
                          <p className="font-bold">
                            {productDetails.delivery_time
                              ? t("deliveryTime", {
                                  days: productDetails.delivery_time,
                                })
                              : t("updating")}
                          </p>
                          <ul className="space-y-1 text-gray-700 text-sm">
                            {productDetails.carrier === "amm" && (
                              <>
                                <li className="flex items-start gap-2">
                                  <span className="text-base leading-5">•</span>
                                  <span>
                                    Lieferung{" "}
                                    <strong>frei Bordsteinkante</strong>{" "}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="inline-block w-3.5 h-3.5 text-gray-500 ml-1 mb-0.5" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-secondary">
                                        <p className="text-white text-sm">
                                          „Frei Bordsteinkante“ bedeutet:
                                          Lieferung bis zur Grundstücksgrenze –
                                          kein Transport ins Haus oder zur
                                          Wohnung.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </span>
                                </li>

                                <li className="flex items-start gap-2">
                                  <span className="text-base leading-5">•</span>
                                  <span className="text-base">
                                    Speditionsversand nach Terminabsprache
                                  </span>
                                </li>
                              </>
                            )}

                            <li className="flex items-start gap-2">
                              <span className="text-base leading-5">•</span>
                              <span className="text-base">
                                Versand aus Deutschland
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {parentProduct && parentProduct?.variants?.length > 0 && (
                      <ListVariant
                        variant={parentProduct.variants}
                        currentProduct={productDetails}
                        parentProduct={parentProduct}
                      />
                    )}

                    {/* <div className='grid grid-cols-2 gap-2'>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/1.svg'}
                                                width={36}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}
                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/2.svg'}
                                                width={36}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}

                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/3.svg'}
                                                width={36}
                                                // sizes={16}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}
                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/4.svg'}
                                                width={36}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}

                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                    </div> */}

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
                            handleAddProductToWishlist();
                          }}
                          className="bg-white rounded-md aspect-square text-gray-500 cursor-pointer font-bold flex items-center justify-center hover:text-white border-secondary border  hover:bg-secondary g:min-h-[40px] lg:h-fit !h-[40px]"
                        >
                          <Heart />
                        </div>
                      </div>
                    </div>

                    {/* Voucher */}
                    {/* <div className='flex lg:flex-row flex-col justify-center gap-2 mt-6'>
                                        {vouchers.map((item, index) => (
                                            <ProductVoucher
                                                item={item}
                                                key={index}
                                                isSelected={selectedVoucher === item.id}
                                                onSelect={() => handleSelectVoucher(item.id)}
                                            />
                                        ))}
                                    </div> */}
                  </div>
                </div>

                {/*Product tabs */}
                <div className="lg:mt-12 mt-8">
                  <ProductDetailsTab product={productDetails} />
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
