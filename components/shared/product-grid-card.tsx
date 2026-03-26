"use client";

import Image from "next/image";
import { ProductItem } from "@/types/products";
import { cn } from "@/lib/utils";
import { Link } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { useAddViewedProduct } from "@/features/viewed/hook";
import ProductPricingField from "./product-pricing-field";
import ProductBrand from "../layout/single-product/product-brand";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: ProductItem;
  className?: string;
  isProductDetails?: boolean;
  isLCP?: boolean;
}

export default function ProductCard({
  product,
  className,
  isProductDetails,
  isLCP,
}: ProductCardProps) {
  const locale = useLocale();
  const addProductToViewMutation = useAddViewedProduct();
  const [canHover, setCanHover] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [shouldLoadAltImage, setShouldLoadAltImage] = useState(false);
  const altImageUrl = product.static_files?.[1]?.url;
  const enableAltHover = canHover && !isMobileViewport;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const updateMediaState = () => {
      setCanHover(hoverQuery.matches);
      setIsMobileViewport(mobileQuery.matches);
    };

    updateMediaState();

    hoverQuery.addEventListener("change", updateMediaState);
    mobileQuery.addEventListener("change", updateMediaState);

    return () => {
      hoverQuery.removeEventListener("change", updateMediaState);
      mobileQuery.removeEventListener("change", updateMediaState);
    };
  }, []);

  const handleAddProductToViewed = (productId: string) => {
    addProductToViewMutation.mutate({ productId: productId });
  };

  return (
    <div className={cn("relative group", className)} key={product.id_provider}>
      <div
        key={product.id}
        className="relative overflow-hidden z-10 h-full"
        onClick={() => handleAddProductToViewed(product.id)}
      >
        <div className="bg-white p-0 group z-0">
          <Link
            href={`/product/${product.url_key}`}
            locale={locale}
            passHref
            prefetch={false}
            className="cursor-pointer"
          >
            <div
              className="relative mb-2 w-full lg:h-96 h-60 overflow-hidden rounded-md bg-white group flex items-center justify-center"
              onMouseEnter={() => {
                if (enableAltHover && altImageUrl) setShouldLoadAltImage(true);
              }}
              onFocus={() => {
                if (enableAltHover && altImageUrl) setShouldLoadAltImage(true);
              }}
            >
              {/* Image 1 */}
              <Image
                src={
                  product.static_files?.[0]?.url || "/placeholder-product.webp"
                }
                alt={product.name}
                fill
                priority={isLCP} // 🔥 QUAN TRỌNG
                loading={isLCP ? "eager" : "lazy"}
                sizes="(max-width: 768px) 50vw, 25vw"
                className={cn(
                  "object-contain transition-all duration-500 ease-in-out",
                  enableAltHover &&
                    "group-hover:-translate-x-6 group-hover:opacity-0",
                )}
              />

              {/* Image 2 */}
              {altImageUrl && shouldLoadAltImage && enableAltHover && (
                <Image
                  src={altImageUrl}
                  alt={product.name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={cn(
                    "object-contain translate-x-6 opacity-0 transition-all duration-500 ease-in-out",
                    enableAltHover &&
                      "group-hover:translate-x-0 group-hover:opacity-100",
                  )}
                />
              )}
            </div>
          </Link>

          <div className="product-details py-2 mt-0 md:mt-4 xl:mt-4 flex flex-col gap-1">
            <ProductBrand
              brand={product.brand.name}
              brand_image={product.brand ? product.brand.img_url : ""}
              isProductDetail={isProductDetails}
            />
            <Link
              href={`/product/${product.url_key}`}
              locale={locale}
              passHref
              prefetch={false}
              className="cursor-pointer"
            >
              <h3 className="text-xs md:text-lg text-black text-left line-clamp-2">
                {product.name}
              </h3>
            </Link>

            <div className="flex">
              <ProductPricingField
                product={product}
                isProductDetails={isProductDetails}
              />
            </div>
          </div>

          {/* Four lines starting from center of each edge */}
          {/* <span className="absolute bottom-0 left-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
          <span className="absolute top-0 left-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
          <span className="absolute top-0 right-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300  group-hover:scale-x-100"></span>
          <span className="absolute bottom-0 right-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span> */}
        </div>
        <div className="flex gap-1 items-center mt-0 md:mt-0 lg:mt-0 pb-4">
          {/* <Button
            type="button"
            variant={"ghost"}
            size={"lg"}
            aria-label="Add to cart"
            className="md:has-[>svg]:px-2.5 lg:has-[>svg]:px-3 has-[>svg]:px-2 bg-secondary/90 hover:bg-secondary rounded-full group h-8 md:h-10 lg:h-12"
            onClick={() => {
              handleAddToCart(product);
              if (isMobile) return;
              setOpen(true);
            }}
          >
            <ShoppingBasket className="size-4 md:size-6 text-white transition-transform duration-200 group-hover:scale-110" />
          </Button> */}
          {/* <div className="md:block hidden">
            <CartDrawer
              open={open}
              onOpenChange={setOpen}
            />
          </div> */}
        </div>
      </div>
      {/* {product.stock === 0 && (
                      <div className="px-3 py-1 text-[#29ABE2] bg-[#D4EEF9] rounded-full absolute top-4 z-30 right-4 text-sm">
                        bald verfügbar
                      </div>
                    )} */}
      {/* {product.stock === 0 && (
                      <div
                        className="
          absolute inset-0  
          backdrop-blur-[2px] 
          bg-white/50 
          transition-all duration-300 
          group-hover:backdrop-blur-none 
          group-hover:bg-transparent z-20 group-hover:z-0
        "
                      ></div>
                    )} */}
    </div>
  );
}
