import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import { CartItemLocal } from "@/lib/utils/cart";
import { CartItem } from "@/types/cart";
import { useCartLocal } from "@/hooks/cart";
import { CartTableItem } from "./cart-local-table";
import {
  useDeleteCartItem,
  useUpdateCartItemQuantity,
} from "@/features/cart/hook";
import { toast } from "sonner";
import React, { useCallback } from "react";
import { debounce } from "lodash";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import QuantityControl from "./quantity-input";
import {
  formatDateDE,
  getDeliveryDayRange,
  getLatestInventory,
} from "../single-product/details/logistics";
import { addBusinessDays } from "date-fns";
import { InventoryItem } from "@/types/products";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useAddToWishList } from "@/features/wishlist/hook";
import { HandleApiError } from "@/lib/api-helper";

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
  inventory: InventoryItem[];
  url_key: string;
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
        inventory: cartServer.products.inventory,
        url_key: cartServer.products.url_key,
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
      }
    : null;

  if (!item) return null;

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
  const debouncedUpdate = useCallback(
    debounce((itemId: string, quantity: number) => {
      updateCartItemQuantityMutation.mutate(
        { cartItemId: itemId, quantity },
        {
          onSuccess: () => console.log("✅ Cập nhật thành công"),
          onError: () => console.log("❌ Cập nhật thất bại"),
        },
      );
    }, 400),
    [],
  );

  const handleUpdateCartItemQuantity = (
    item: CartItem,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      deleteCartItemMutation.mutate(item.id, {
        onSuccess: () => console.log("✅ Xóa thành công"),
        onError: () => console.log("❌ Xóa thất bại"),
      });
      return;
    }

    if (newQuantity > item.products.stock) {
      toast.error("Vượt quá số lượng tồn kho");
      return;
    }

    debouncedUpdate(item.id, newQuantity);
  };

  const handleIncrease = () => {
    const newQty = item.quantity + 1;

    if (userId && cartServer) {
      handleUpdateCartItemQuantity(cartServer, newQty);
    } else if (localProducts) {
      onUpdateQuantity(localProducts as any, newQty);
    }
  };

  const handleDecrease = () => {
    const newQty = item.quantity - 1;

    // 👉 CART SERVER
    if (userId && cartServer) {
      handleUpdateCartItemQuantity(cartServer, newQty);
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

  const latestInventory = React.useMemo(
    () => getLatestInventory(item.inventory),
    [item.inventory],
  );

  const deliveryDayRange = React.useMemo(
    () => getDeliveryDayRange(item.deliveryText),
    [item.deliveryText],
  );

  const estimatedDeliveryRange = React.useMemo(() => {
    if (!deliveryDayRange) return null;

    let startDate: Date | null = null;

    // CASE 1: hết hàng + có inventory
    if (item.stock === 0 && latestInventory) {
      startDate = new Date(latestInventory.date_received);
    }

    // CASE 2: còn hàng
    if (item.stock > 0) {
      startDate = new Date();
    }

    // CASE 3: stock = 0 & không inventory
    if (!startDate) return null;

    return {
      from: addBusinessDays(startDate, deliveryDayRange.min),
      to: addBusinessDays(startDate, deliveryDayRange.max),
    };
  }, [deliveryDayRange, item.stock, latestInventory]);

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
            <Link
              href={`/product/${item.url_key}`}
              locale={locale}
              className="font-semibold leading-snug text-black"
            >
              {item.name}
            </Link>

            <p className="text-black">
              {item.length && `L ${item.length}`}
              {" x "}
              {item.width && `W ${item.width}`}
              {" x "}
              {item.height && `H ${item.height}`}
            </p>

            {item.brand && <p className="text-black">{item.brand}</p>}

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
              quantity={item.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              // stock={item.stock}
              isLoading={updateCartItemQuantityMutation.isPending}
            />
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
          </div>
          {/* RIGHT */}
          <div className="flex flex-col items-end justify-between">
            {/* PRICE */}
            <div className="text-lg font-semibold">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
