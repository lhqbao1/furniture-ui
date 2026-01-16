"use client";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/features/cart/hook";
import { useAddToCartLocalEnhanced } from "@/hooks/cart/add-to-cart-enhanched";
import { HandleApiError } from "@/lib/api-helper";
import { useRouter } from "@/src/i18n/navigation";
import { userIdAtom } from "@/store/auth";
import { ProductItem } from "@/types/products";
import { useAtom } from "jotai";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { toast } from "sonner";

interface BoughtTogetherAddToCartProps {
  product_id: string;
  quantity: number;
  productDetails: ProductItem;
}

const BoughtTogetherAddToCart = ({
  product_id,
  quantity,
  productDetails,
}: BoughtTogetherAddToCartProps) => {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const [userId, setUserId] = useAtom(userIdAtom);
  const addToCartMutation = useAddToCart();
  const { addToCartLocalOnly } = useAddToCartLocalEnhanced();

  const handleAddToCart = () => {
    // LOCAL CART
    if (!userId) {
      addToCartLocalOnly(productDetails, 1);
      return;
    }

    if (userId) {
      addToCartMutation.mutate(
        {
          productId: product_id,
          quantity: 1,
        },
        {
          onSuccess: () => toast.success(t("addToCartSuccess")),
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
    }
  };

  return (
    <Button
      className="rounded-md font-bold flex-1 lg:px-12 px-6 mr-1 text-center justify-center text-sm w-fit"
      type="button"
      onClick={() => handleAddToCart()}
    >
      {t("addToCart")}
    </Button>
  );
};

export default BoughtTogetherAddToCart;
