"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import ListReviewButton from "./list-review-buttons";
import gsap from "gsap";
import { ProductItem } from "@/types/products";
import { useMediaQuery } from "react-responsive";
import { useAddViewedProduct } from "@/features/viewed/hook";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { Heart, ShoppingBasket, Star } from "lucide-react";
import { Button } from "../ui/button";
import { useAddToCart } from "@/features/cart/hook";
import { useAddToWishList } from "@/features/wishlist/hook";
import { useCartLocal } from "@/hooks/cart";
import { toast } from "sonner";
import { HandleApiError } from "@/lib/api-helper";
import { CartItemLocal } from "@/lib/utils/cart";

interface ProductsGridLayoutProps {
  hasBadge?: boolean;
  hasPagination?: boolean;
  data: ProductItem[];
}

const ProductsGridLayout = ({
  hasBadge,
  hasPagination = false,
  data,
}: ProductsGridLayoutProps) => {
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 650 });
  const addProductToViewMutation = useAddViewedProduct();
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishList();
  const { addToCartLocal, cart } = useCartLocal();

  useEffect(() => {
    cardRefs.current.forEach((card) => {
      const btn = card.querySelector<HTMLDivElement>(".list-review-btn");
      if (!btn) return;

      gsap.set(btn, { display: "none", opacity: 0 });

      card.addEventListener("mouseenter", () => {
        gsap.fromTo(
          btn,
          { x: 20 },
          { display: "block", opacity: 1, duration: 0.3, x: 0 }
        );
      });
      card.addEventListener("mouseleave", () => {
        gsap.fromTo(
          btn,
          { x: 0 },
          {
            x: 0,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              gsap.set(btn, { display: "none" });
            },
          }
        );
      });
    });
  }, []);

  const handleAddProductToViewed = (productId: string) => {
    addProductToViewMutation.mutate({ productId: productId });
  };

  const handleAddToCart = (currentProduct: ProductItem) => {
    if (!currentProduct) return;
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const existingItem = cart.find(
        (item: CartItemLocal) => item.product_id === currentProduct.id
      );
      const totalQuantity = (existingItem?.quantity || 0) + 1;
      if (totalQuantity > currentProduct.stock) {
        toast.error(t("notEnoughStock"));
        return;
      }
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
        }
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
          if (status === 400) {
            toast.error(t("notEnoughStock"));
            return;
          }
          toast.error(message);
          if (status === 401) router.push("/login", { locale });
        },
      }
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-0 sm:mt-6 mt-4">
        {data.map((product, idx) => {
          return (
            <div
              key={product.id}
              className="relative overflow-hidden"
              ref={(el) => {
                if (el) cardRefs.current[idx] = el;
              }}
              onClick={() => handleAddProductToViewed(product.id)}
              style={{
                borderTop: isMobile
                  ? undefined
                  : idx < 4
                  ? ""
                  : "1px solid #e0e0e0",
                borderRight: isMobile
                  ? undefined
                  : idx === 3 || idx === 7
                  ? ""
                  : "1px solid #e0e0e0",
              }}
            >
              <Link href={`/product/${product.url_key}`} passHref>
                <div className="bg-white p-0 group cursor-pointer z-0 pt-4 lg:px-4 px-2">
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

                  <div className="product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1">
                    <h3 className="text-lg text-black text-left line-clamp-2 lg:min-h-[60px] min-h-[52px]">
                      {product.name}
                    </h3>
                    <div className="flex gap-2 flex-col">
                      <div className="inline-flex items-end justify-start w-fit gap-6 font-bold text-gray-900 relative">
                        <div className="text-4xl">
                          {Math.floor(
                            product.final_price
                              ? product.final_price
                              : product.price
                          )}
                        </div>
                        <div className="text-base font-bold text-gray-700 absolute top-0 right-2.5">
                          ,
                          {
                            (
                              (product.final_price
                                ? product.final_price
                                : product.price) % 1
                            )
                              .toFixed(2)
                              .split(".")[1]
                          }
                        </div>
                        <div className="text-base font-semibold text-black">
                          €
                        </div>
                      </div>

                      {product.price && product.price > product.final_price && (
                        <p className="text-base mb-1">
                          Vorher: €
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
              </Link>
              <div className="space-x-3 mt-3 pb-4 lg:px-4 px-2">
                <Button
                  variant={"ghost"}
                  size={"lg"}
                  className="has-[>svg]:px-2 bg-secondary/90 hover:bg-secondary rounded-full group"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBasket className="size-6 text-white transition-transform duration-200 group-hover:scale-110" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="has-[>svg]:px-2 rounded-full hover:bg-secondary hover:text-white transition-colors duration-200"
                  onClick={() => handleAddToWishlist(product)}
                >
                  <Heart className="size-6 stroke-current transition-colors duration-200" />
                </Button>
              </div>
              {/* <div className="absolute bottom-18 right-0 list-review-btn">
                                <ListReviewButton currentProduct={product} />
                            </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsGridLayout;
