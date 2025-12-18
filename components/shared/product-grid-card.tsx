"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ProductItem } from "@/types/products";
import { Heart, ShoppingBasket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { currentVoucherAtom, lastVoucherAtom } from "@/store/voucher";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { userIdAtom } from "@/store/auth";
import { useAddToCart } from "@/features/cart/hook";
import { useAddToWishList } from "@/features/wishlist/hook";
import { useCartLocal } from "@/hooks/cart";
import { useAddViewedProduct } from "@/features/viewed/hook";
import { CartItemLocal } from "@/lib/utils/cart";
import { toast } from "sonner";
import { HandleApiError } from "@/lib/api-helper";
import { useMediaQuery } from "react-responsive";
import { usePrevious } from "@uidotdev/usehooks";
import CountUp from "../CountUp";

interface ProductCardProps {
  product: ProductItem;
  className?: string;
  idx: number;
}

export default function ProductCard({
  product,
  className,
  idx,
}: ProductCardProps) {
  const [currentVoucher] = useAtom(currentVoucherAtom);
  const [lastVoucher, setLastVoucher] = useAtom(lastVoucherAtom);

  const cardRefs = useRef<HTMLDivElement[]>([]);
  const voucherRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations();
  const isMobile = useMediaQuery({ maxWidth: 650 });

  const router = useRouter();
  const locale = useLocale();
  const [userId, setUserId] = useAtom(userIdAtom);

  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishList();
  const addProductToViewMutation = useAddViewedProduct();
  const { addToCartLocal, cart } = useCartLocal();

  // ✅ check voucher match
  const matchedVoucher = product.vouchers?.find((v) => v.id === currentVoucher);

  const basePrice = product.final_price ?? 0;

  const priceAfterVoucher = useMemo(() => {
    if (!matchedVoucher) return basePrice;

    const { discount_type, discount_value } = matchedVoucher;

    let discountedPrice = basePrice;

    if (discount_type === "percent") {
      discountedPrice = basePrice * (1 - discount_value / 100);
    }

    if (discount_type === "fixed") {
      discountedPrice = basePrice - discount_value;
    }

    // không cho âm
    return Math.max(discountedPrice, 0);
  }, [basePrice, matchedVoucher]);

  const shouldAnimate = !!matchedVoucher && matchedVoucher.id !== lastVoucher;

  const prevPrice = usePrevious(priceAfterVoucher) ?? basePrice;

  const handleAddProductToViewed = (productId: string) => {
    addProductToViewMutation.mutate({ productId: productId });
  };

  const handleAddToCart = (currentProduct: ProductItem) => {
    if (!currentProduct) return;

    if (!userId) {
      const existingItem = cart.find(
        (item: CartItemLocal) => item.product_id === currentProduct.id,
      );
      const totalQuantity = (existingItem?.quantity || 0) + 1;
      // if (totalQuantity > currentProduct.stock) {
      //   toast.error(t("notEnoughStock"));
      //   return;
      // }
      addToCartLocal(
        {
          item: {
            product_id: currentProduct.id,
            quantity: 1,
            is_active: true,
            item_price: currentProduct.final_price,
            final_price: currentProduct.final_price,
            img_url:
              currentProduct.static_files.length > 0
                ? currentProduct.static_files[0].url
                : "",
            product_name: currentProduct.name,
            stock: currentProduct.stock,
            carrier: currentProduct.carrier ? currentProduct.carrier : "amm",
            id_provider: currentProduct.id_provider
              ? currentProduct.id_provider
              : "",
            delivery_time: currentProduct.delivery_time
              ? currentProduct.delivery_time
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
        },
      );
    } else {
      addToCartMutation.mutate(
        { productId: currentProduct.id ?? "", quantity: 1 },
        {
          onSuccess(data, variables, context) {
            toast.success(t("addToCartSuccess"));
          },
          onError(error, variables, context) {
            const { status, message } = HandleApiError(error, t);
            // if (status === 400) {
            //   toast.error(t("notEnoughStock"));
            //   return;
            // }
            toast.error(message);
            if (status === 401) router.push("/login", { locale });
          },
        },
      );
    }
  };

  const handleAddToWishlist = (currentProduct: ProductItem) => {
    if (!currentProduct) return;
    addToWishlistMutation.mutate(
      { productId: currentProduct.id ?? "", quantity: 1 },
      {
        onSuccess(data, variables, context) {
          toast.success(t("addToWishlistSuccess"));
        },
        onError(error, variables, context) {
          const { status, message } = HandleApiError(error, t);
          // if (status === 400) {
          //   toast.error(t("notEnoughStock"));
          //   return;
          // }
          toast.error(message);
          if (status === 401) router.push("/login", { locale });
        },
      },
    );
  };

  /**
   * GSAP animation khi voucher xuất hiện / biến mất
   */
  useEffect(() => {
    if (!voucherRef.current) return;

    const el = voucherRef.current;
    let tween: gsap.core.Tween;

    if (matchedVoucher) {
      tween = gsap.fromTo(
        el,
        { x: 24, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.7)",
        },
      );
    } else {
      tween = gsap.to(el, {
        x: 24,
        opacity: 0,
        scale: 0.9,
        duration: 0.25,
        ease: "back.in(1.7)",
      });
    }

    return () => {
      tween?.kill(); // 🔥 cleanup
    };
  }, [matchedVoucher]);

  return (
    <div
      className="relative group"
      key={product.id_provider}
    >
      <div
        key={product.id}
        className="relative overflow-hidden z-10 h-full"
        ref={(el) => {
          if (el) cardRefs.current[idx] = el;
        }}
        onClick={() => handleAddProductToViewed(product.id)}
        style={{
          borderTop: isMobile ? undefined : idx < 4 ? "" : "1px solid #e0e0e0",
          borderRight: isMobile
            ? undefined
            : idx === 3 || idx === 7
            ? ""
            : "1px solid #e0e0e0",
        }}
      >
        {/* <Link
          href={`/product/${product.url_key}`}
          locale={locale}
          passHref
        >
        
        </Link> */}
        <div className="bg-white p-0 group cursor-pointer z-0 pt-4 lg:px-4 px-2">
          <Link
            href={`/product/${product.url_key}`}
            locale={locale}
            passHref
          >
            <Image
              width={200}
              height={200}
              src={
                product.static_files && product.static_files.length > 0
                  ? product.static_files[0].url
                  : "/placeholder-product.webp"
              }
              alt={product.name}
              className="w-full h-48 md:h-64 py-0 md:py-2 object-contain mb-2 rounded group-hover:scale-120 duration-500"
            />
          </Link>

          <div className="product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1">
            <Link
              href={`/product/${product.url_key}`}
              locale={locale}
              passHref
            >
              <h3
                className={cn(
                  "text-lg text-black text-left line-clamp-2 ",
                  className ? className : "lg:min-h-[60px] min-h-[52px]",
                )}
              >
                {product.name}
              </h3>
            </Link>

            <div className="flex gap-2 flex-col">
              <div className="flex gap-2 items-end">
                <div className="inline-flex items-end justify-start w-fit gap-2 font-bold text-gray-900 relative">
                  {/* <div className="text-4xl">
                      {Math.floor(priceAfterVoucher ? priceAfterVoucher : 0)}
                    </div>
                    <div className="text-base font-bold text-gray-700 absolute top-0 right-2.5">
                      ,
                      {
                        (
                          (priceAfterVoucher
                            ? priceAfterVoucher
                            : product.price) % 1
                        )
                          .toFixed(2)
                          .split(".")[1]
                      }
                    </div> */}
                  {shouldAnimate ? (
                    <CountUp
                      from={prevPrice}
                      to={priceAfterVoucher}
                      duration={0.8}
                      className="text-3xl"
                      startWhen={shouldAnimate}
                      onEnd={() => {
                        if (matchedVoucher) {
                          setLastVoucher(matchedVoucher.id);
                        }
                      }}
                    />
                  ) : (
                    <div className="text-3xl">
                      {priceAfterVoucher.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}

                  <div className="text-base font-semibold text-black">€</div>
                </div>

                {/* 🎯 VOUCHER */}
                <div
                  ref={voucherRef}
                  className={cn(
                    "bg-primary/90 rounded-sm text-xs uppercase text-white py-1 px-2.5 whitespace-nowrap",
                  )}
                >
                  {matchedVoucher
                    ? matchedVoucher.discount_type === "fixed"
                      ? `${
                          matchedVoucher.code
                        }: €${matchedVoucher.discount_value.toLocaleString(
                          "de-DE",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}`
                      : `${matchedVoucher.code}: -${matchedVoucher.discount_value}%`
                    : "Andere Produkte"}
                </div>
              </div>

              {product.price && product.price > product.final_price && (
                <p className="text-base mb-1">
                  {!product.owner ||
                  product.owner.business_name === "Prestige Home"
                    ? t("ogPrice")
                    : t("ogPriceSupplier")}
                  : €
                  {product.price.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}

              <div className="space-x-2 flex items-center">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((item) => {
                    return (
                      <div key={item}>
                        <Star size={18} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-base font-semibold">(0)</p>
              </div>
            </div>
          </div>

          {/* Four lines starting from center of each edge */}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
          <span className="absolute top-0 left-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
          <span className="absolute top-0 right-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300  group-hover:scale-x-100"></span>
          <span className="absolute bottom-0 right-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
        </div>
        <div className="space-x-3 mt-3 pb-4 lg:px-4 px-2">
          <Button
            type="button"
            variant={"ghost"}
            size={"lg"}
            aria-label="Add to cart"
            className="has-[>svg]:px-2 bg-secondary/90 hover:bg-secondary rounded-full group"
            onClick={() => handleAddToCart(product)}
          >
            <ShoppingBasket className="size-6 text-white transition-transform duration-200 group-hover:scale-110" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            aria-label="Add to cart"
            className="has-[>svg]:px-2 rounded-full hover:bg-secondary hover:text-white transition-colors duration-200"
            onClick={() => handleAddToWishlist(product)}
          >
            <Heart className="size-6 stroke-current transition-colors duration-200" />
          </Button>
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
