import Image from "next/image";
import { Heart, Loader2, Trash, Trash2 } from "lucide-react";
import { CartItemLocal } from "@/lib/utils/cart";
import { CartItem } from "@/types/cart";
import { useCartLocal } from "@/hooks/cart";
import { CartTableItem } from "./cart-local-table";
import {
  useDeleteCartItem,
  useUpdateCartItemQuantity,
} from "@/features/cart/hook";
import { toast } from "sonner";
import React, { useCallback, useState } from "react";
import { debounce } from "lodash";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import QuantityControl from "./quantity-input";

import { addBusinessDays } from "date-fns";
import { InventoryPosItem } from "@/types/products";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useAddToWishList } from "@/features/wishlist/hook";
import { HandleApiError } from "@/lib/api-helper";
import ProductBrand from "../single-product/product-brand";
import { getDeliveryDayRange } from "@/hooks/get-estimated-shipping";
import { formatDateDE } from "@/lib/format-date-DE";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { useInventoryPoByProductId } from "@/features/incoming-inventory/inventory/hook";

interface CartItemProps {
  cartServer?: CartItem;
  localProducts?: CartItemLocal;
}

type CartItemUI = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  brand?: string;
  variant?: string;
  deliveryText?: string;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  stock: number;
  inventory: InventoryPosItem[];
  url_key: string;
  id_provider?: string;
  result_stock: number;
};

const CartItemCard = ({ cartServer, localProducts }: CartItemProps) => {
  const [userId, setUserId] = useAtom(userIdAtom);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  /* -------------------------------------------------
   * Normalize data (server cart | local cart)
   * -------------------------------------------------*/
  const item: CartItemUI | null = cartServer
    ? {
        id: cartServer.id,
        name: cartServer.products.name,
        image: cartServer.products.static_files[0].url ?? "",
        price: cartServer.products.final_price,
        quantity: cartServer.quantity ?? 1,
        brand: cartServer.products.brand?.name,
        // variant: cartServer.products.,
        // deliveryText: `Lieferung vor Weihnachten: ${cartServer.products.delivery_time} Werktage`,
        deliveryText: cartServer.products.delivery_time,
        length: cartServer.products.length,
        width: cartServer.products.width,
        height: cartServer.products.height,
        color: cartServer.products.color,
        stock: cartServer.products.stock,
        inventory: cartServer.products.inventory_pos,
        url_key: cartServer.products.url_key,
        id_provider: cartServer.products.id_provider,
        result_stock: cartServer.products.result_stock ?? 0,
      }
    : localProducts
      ? {
          id: localProducts.product_id,
          name: localProducts.product_name,
          image: localProducts.img_url,
          price: localProducts.final_price,
          quantity: localProducts.quantity,
          brand: localProducts.brand_name,
          // variant: localProducts.variant,
          // deliveryText: `Lieferung vor Weihnachten: ${localProducts.delivery_time} Werktage`,
          deliveryText: localProducts.delivery_time,
          length: localProducts.length,
          width: localProducts.width,
          height: localProducts.height,
          color: localProducts.color,
          stock: localProducts.stock,
        inventory: localProducts.inventory,
          url_key: localProducts.url_key,
          id_provider: localProducts.id_provider,
          result_stock: localProducts.result_stock ?? 0,
        }
      : null;

  const [uiQuantity, setUiQuantity] = useState<number>(item?.quantity ?? 1);
  React.useEffect(() => {
    if (item?.quantity != null) {
      setUiQuantity(item.quantity);
    }
  }, [item?.quantity]);
  const { updateQuantity } = useCartLocal();
  const { removeItem } = useCartLocal();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantity();
  const deleteCartItemMutation = useDeleteCartItem();
  const addToWishlistMutation = useAddToWishList();

  const onUpdateQuantity = (item: CartTableItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (item.stock && newQuantity > item.stock) return;
    updateQuantity({ product_id: item.product_id, quantity: newQuantity });
  };

  // ✅ debounce API update
  const debouncedUpdate = React.useCallback(
    debounce((itemId: string, quantity: number) => {
      updateCartItemQuantityMutation.mutate(
        { cartItemId: itemId, quantity },
        {
          onError: () => {
            toast.error(t("updateCartFail"));
            setUiQuantity(item?.quantity ?? 1); // 🔁 rollback
          },
        },
      );
    }, 500),
    [item?.quantity],
  );

  const handleUpdateCartItemQuantity = (
    item: CartItem,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      handleRemoveCartItemServer(item.id);
      return;
    }

    const totalIncomingStock =
      item.products.inventory_pos?.reduce((sum, inv) => {
        if (!inv.list_delivery_date) return sum;
        const date = new Date(inv.list_delivery_date);
        if (Number.isNaN(date.getTime())) return sum;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        if (date < today) return sum;
        return sum + (inv.quantity ?? 0);
      }, 0) ?? 0;

    if (newQuantity > item.products.stock + totalIncomingStock) {
      toast.error(t("notEnoughStock"));
      return;
    }

    debouncedUpdate(item.id, newQuantity);
  };

  const handleRemoveCartItemServer = (id: string) => {
    deleteCartItemMutation.mutate(id, {
      onSuccess(data, variables, context) {
        toast.success(t("removeItemCartSuccess"));
      },
      onError(error, variables, context) {
        toast.error(t("removeItemCartFail"));
      },
    });
  };

  const handleRemove = (id: string) => {
    if (userId && cartServer) {
      handleRemoveCartItemServer(id);
    } else if (localProducts) {
      removeItem(id, {
        onSuccess(data, variables, context) {
          toast.success(t("removeItemCartSuccess"));
        },
        onError(error, variables, context) {
          toast.error(t("removeItemCartFail"));
        },
      }); // ✅ remove local
    }
  };

  const handleIncrease = () => {
    if (!item) return;
    const newQty = uiQuantity + 1; // ✅ ĐÚNG

    setUiQuantity(newQty); // ✅ UI update ngay

    if (userId && cartServer) {
      debouncedUpdate(cartServer.id, newQty);
    } else if (localProducts) {
      onUpdateQuantity(localProducts as any, newQty);
    }
  };

  const handleDecrease = () => {
    if (!item) return;
    const newQty = uiQuantity - 1; // ✅ ĐÚNG

    if (newQty <= 0) {
      handleRemove(item.id);
      return;
    }

    setUiQuantity(newQty);

    // 👉 CART SERVER
    if (userId && cartServer) {
      debouncedUpdate(cartServer.id, newQty);
      return;
    }

    // 👉 CART LOCAL
    if (localProducts) {
      if (newQty <= 0) {
        removeItem(localProducts.product_id); // ✅ remove local
        return;
      }

      onUpdateQuantity(localProducts as any, newQty);
    }
  };

  const productIdForInventoryPo =
    cartServer?.products?.id ?? localProducts?.product_id;
  const { data: inventoryPo } = useInventoryPoByProductId(productIdForInventoryPo);

  const deliveryDayRange = React.useMemo(
    () => getDeliveryDayRange(item?.deliveryText),
    [item?.deliveryText],
  );

  const availableStock = React.useMemo(
    () =>
      calculateAvailableStock(
        item
          ? {
              stock: item.stock,
              result_stock: item.result_stock,
            }
          : null,
      ),
    [item?.stock, item?.result_stock],
  );

  const incomingStock = React.useMemo(() => {
    const items = Array.isArray(inventoryPo)
      ? inventoryPo
      : inventoryPo
        ? [inventoryPo]
        : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.reduce((sum, inv) => {
      if ((inv.quantity ?? 0) <= 0) return sum;
      if (!inv.list_delivery_date) return sum;
      const date = new Date(inv.list_delivery_date);
      if (Number.isNaN(date.getTime())) return sum;
      date.setHours(0, 0, 0, 0);
      if (date < today) return sum;
      return sum + (inv.quantity ?? 0);
    }, 0);
  }, [inventoryPo]);

  const totalStock = availableStock + incomingStock;

  const nextIncomingDate = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = Array.isArray(inventoryPo)
      ? inventoryPo
      : inventoryPo
        ? [inventoryPo]
        : [];

    const futureDates = items
      .filter((inv) => (inv.quantity ?? 0) > 0 && inv.list_delivery_date)
      .map((inv) => new Date(inv.list_delivery_date))
      .filter((date) => {
        if (Number.isNaN(date.getTime())) return false;
        date.setHours(0, 0, 0, 0);
        return date >= today;
      })
      .sort((a, b) => a.getTime() - b.getTime());

    if (futureDates.length === 0) return null;
    return futureDates[0];
  }, [inventoryPo]);

  const addCalendarDays = React.useCallback((startDate: Date, days: number) => {
    const result = new Date(startDate);
    result.setDate(result.getDate() + days);
    return result;
  }, []);

  const estimatedDeliveryRange = React.useMemo(() => {
    if (!deliveryDayRange) return null;
    if (totalStock > 0) {
      const today = new Date();
      return {
        from: addCalendarDays(today, deliveryDayRange.min),
        to: addCalendarDays(today, deliveryDayRange.max),
      };
    }

    if (!nextIncomingDate) {
      const today = new Date();
      return {
        from: addCalendarDays(today, deliveryDayRange.min),
        to: addCalendarDays(today, deliveryDayRange.max),
      };
    }

    return {
      from: addBusinessDays(nextIncomingDate, deliveryDayRange.min),
      to: addBusinessDays(nextIncomingDate, deliveryDayRange.max),
    };
  }, [
    deliveryDayRange,
    totalStock,
    nextIncomingDate,
    addCalendarDays,
  ]);

  const handleAddToWishlist = (id: string) => {
    if (!id) return;
    addToWishlistMutation.mutate(
      { productId: id ?? "", quantity: 1 },
      {
        onSuccess(data, variables, context) {
          toast.success("Added to wishlist");
        },
        onError(error, variables, context) {
          const { status, message } = HandleApiError(error, t);
          toast.error(message);
          if (status === 401) router.push("/login", { locale });
        },
      },
    );
  };

  /* -------------------------------------------------
   * UI
   * -------------------------------------------------*/
  if (!item) return null;

  return (
    <div className="flex gap-6 border-b py-6 items-center">
      {/* IMAGE */}
      <div className="relative w-[120px] h-[120px] shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover cursor-pointer rounded-sm"
        />
      </div>

      {/* CONTENT */}
      <div className="w-full">
        <div className="flex flex-col justify-between">
          <div>
            {item.brand && <ProductBrand brand={item.brand} />}
            <Link
              href={`/product/${item.url_key}`}
              locale={locale}
              className="font-semibold leading-snug text-black hover:text-secondary transition-all duration-150"
            >
              {item.name}
            </Link>

            <div>
              {t("itemNumber")}: {item.id_provider}
            </div>

            {item.deliveryText && (
              <p className="text-secondary mt-6">
                {estimatedDeliveryRange ? (
                  <>
                    {t.rich("deliveryDateRange", {
                      from: formatDateDE(estimatedDeliveryRange.from),
                      to: formatDateDE(estimatedDeliveryRange.to),
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </>
                ) : item.deliveryText ? (
                  t("deliveryTime", {
                    days: item.deliveryText,
                  })
                ) : (
                  t("updating")
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex md:flex-row flex-col-reverse md:items-end items-start justify-between mt-6">
          {/* QUANTITY */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm">Anzahl:</span>
            <QuantityControl
              quantity={uiQuantity ?? 0}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              isLoading={false} // ❌ KHÔNG block UI
            />
            <div className="space-x-2">
              <button
                className="cursor-pointer group"
                aria-label="Add to wishlist"
              >
                <Heart
                  size={18}
                  className="
                  transition
                  text-muted-foreground
                  group-hover:text-secondary
                  group-hover:fill-secondary
                "
                  onClick={() => handleAddToWishlist(item.id)}
                />
              </button>
              <button
                className="cursor-pointer group"
                aria-label="Add to wishlist"
              >
                <Trash
                  size={18}
                  className="
                  transition
                  text-muted-foreground
                  group-hover:text-red-600
                  group-hover:fill-red-600
                "
                  onClick={() => handleRemove(item.id)}
                />
              </button>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col items-end justify-between">
            {/* PRICE */}
            {/* <div className="text-lg font-semibold">
              {updateCartItemQuantityMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {(item.price * item.quantity).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </>
              )}
            </div> */}
            <div className="text-lg font-semibold">
              {(item.price * uiQuantity).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
