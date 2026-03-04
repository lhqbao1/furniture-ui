// hooks/useAddToCartHandler.ts
"use client";

import { toast } from "sonner";
import { useAddToCart } from "@/features/cart/hook";
import { useAddToWishList } from "@/features/wishlist/hook";
import { HandleApiError } from "@/lib/api-helper";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { ProductItem } from "@/types/products";
import { useAddToCartLocalEnhanced } from "../cart/add-to-cart-enhanched";

interface HandleSubmitOptions {
  onSuccess?: () => void;
}

export function useAddToCartHandler(productDetails: ProductItem) {
  const createCartMutation = useAddToCart();
  const addProductToWishlistMutation = useAddToWishList();
  const t = useTranslations();
  const [userId] = useAtom(userIdAtom);
  const { addToCartLocalOnly } = useAddToCartLocalEnhanced();

  const router = useRouter();
  const locale = useLocale();

  const handleAddWishlist = () => {
    addProductToWishlistMutation.mutate(
      { productId: productDetails?.id ?? "", quantity: 1 },
      {
        onSuccess: () => toast.success(t("addToWishlistSuccess")),
        onError: (error) => {
          const { message } = HandleApiError(error, t);
          toast.error(message);
        },
      },
    );
  };

  const handleSubmitToCart = (values: any, options?: HandleSubmitOptions) => {
    if (!productDetails) return;

    // LOCAL CART
    // LOCAL CART
    if (!userId) {
      addToCartLocalOnly(productDetails, values.quantity, {
        onSuccess: options?.onSuccess,
      });
      return;
    }

    // SERVER CART
    createCartMutation.mutate(
      { productId: productDetails.id, quantity: values.quantity },
      {
        onSuccess: () => {
          toast.success(t("addToCartSuccess"));
          options?.onSuccess?.();
        },
        onError: (error) => {
          const { status, message } = HandleApiError(error, t);

          // if (status === 400) {
          //   toast.error(t("notEnoughStock"));
          //   return;
          // }

          toast.error(message);

          if (status === 401) {
            router.push("/login", { locale });
          }
        },
      },
    );
  };

  return {
    handleSubmitToCart,
    handleAddWishlist,
  };
}
