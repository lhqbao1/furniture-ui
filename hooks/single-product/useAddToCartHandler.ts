// hooks/useAddToCartHandler.ts
"use client";

import { toast } from "sonner";
import { useAddToCart } from "@/features/cart/hook";
import { useAddToWishList } from "@/features/wishlist/hook";
import { HandleApiError } from "@/lib/api-helper";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useCartLocal } from "@/hooks/cart";
import { CartItemLocal } from "@/lib/utils/cart";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { ProductItem } from "@/types/products";

export function useAddToCartHandler(productDetails: ProductItem) {
  const createCartMutation = useAddToCart();
  const addProductToWishlistMutation = useAddToWishList();
  const t = useTranslations();
  const [userId, setUserId] = useAtom(userIdAtom);

  const { addToCartLocal, cart } = useCartLocal();
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

  const handleSubmitToCart = (values: any) => {
    if (!productDetails) return;

    // LOCAL CART
    if (!userId) {
      const existingItem = cart.find(
        (item: CartItemLocal) => item.product_id === productDetails.id,
      );

      const totalQuantity = (existingItem?.quantity || 0) + values.quantity;
      const totalIncomingStock =
        productDetails.inventory?.reduce(
          (sum, inv) => sum + (inv.incoming_stock ?? 0),
          0,
        ) ?? 0;

      if (totalQuantity > productDetails.stock + totalIncomingStock) {
        toast.error(t("notEnoughStock"));
        return;
      }

      addToCartLocal(
        {
          item: {
            product_id: productDetails.id,
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
            carrier: productDetails.carrier ?? "amm",
            id_provider: productDetails.id_provider ?? "",
            delivery_time: productDetails.delivery_time ?? "",
            brand_name: productDetails.brand.company_name,
            length: productDetails.length,
            width: productDetails.width,
            height: productDetails.height,
            color: productDetails.color,
            inventory: productDetails.inventory,
            url_key: productDetails.url_key,
          },
        },
        {
          onSuccess: () => toast.success(t("addToCartSuccess")),
          onError: () => toast.error(t("addToCartFail")),
        },
      );

      return;
    }

    // SERVER CART
    createCartMutation.mutate(
      { productId: productDetails.id, quantity: values.quantity },
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
  };

  return {
    handleSubmitToCart,
    handleAddWishlist,
  };
}
