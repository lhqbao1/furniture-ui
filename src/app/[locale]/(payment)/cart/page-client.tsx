"use client";
import React, { useState } from "react";
import CartSummary from "@/components/layout/cart/cart-summary";
import CartTable from "@/components/layout/cart/cart-table";
import { LoginDrawer } from "@/components/shared/login-drawer";
import CartLocalTable from "@/components/layout/cart/cart-local-table";

import { CartActions, useCartData } from "@/hooks/cart/useCart";
import { useAtom } from "jotai";
import { authHydratedAtom, userIdAtom } from "@/store/auth";
import CartItemCard from "@/components/layout/cart/cart-item";
import { CartItem, CartResponseItem } from "@/types/cart";
import { useTranslations } from "next-intl";
import {
  calculateShipping,
  normalizeCartItems,
} from "@/hooks/caculate-shipping";
import CartTitleSkeleton from "@/components/layout/cart/skeleton/cart-page-heading-skeleton";
import CartItemSkeleton from "@/components/layout/cart/skeleton/cart-item-card-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";

function flattenCartItems(carts: CartResponseItem[]): CartItem[] {
  return carts.flatMap((cart) => cart.items);
}

const CartPageClient = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useAtom(userIdAtom);
  const [authHydrated] = useAtom(authHydratedAtom);
  const router = useRouter();
  const t = useTranslations();
  const {
    cart,
    localCart,
    displayedCart,
    isLoadingCart,
    localQuantities,
    setLocalQuantities,
    updateStatus,
    total,
  } = useCartData();

  const { proceedToCheckout } = CartActions({
    userId,
    displayedCart,
    setIsLoginOpen,
  });

  const flatItems = flattenCartItems(cart ?? []);

  const hasServerCart = Array.isArray(cart) && cart.length > 0;

  const normalized = normalizeCartItems(
    hasServerCart ? cart.flatMap((g) => g.items) : localCart,
    hasServerCart,
  );

  const shippingCost = calculateShipping(normalized);

  return (
    <div className="mt-6 md:pb-0 pb-6 lg:px-0 px-4 container-padding overflow-auto">
      <div className="w-full lg:max-w-7xl mx-auto lg:p-6">
        <Button
          variant={"outline"}
          className="mb-2 lg:hidden"
          onClick={() => router.back()}
        >
          {t("back")} <ArrowLeft />
        </Button>
        <div className="grid grid-cols-12 lg:gap-16 gap-6">
          {/* Left: Cart Items */}
          <div className="col-span-12 md:col-span-7">
            {/* CART TITLE */}
            {!authHydrated || (userId && isLoadingCart) ? (
              <CartTitleSkeleton />
            ) : (
              <h3 className="text-3xl font-normal">
                Warenkorb{" "}
                <span className="mb-6 capitalize">
                  (
                  {userId
                    ? cart?.reduce((acc, g) => acc + g.items.length, 0) ?? 0
                    : localCart.length}{" "}
                  <span className="capitalize">{t("items")}</span>)
                </span>
              </h3>
            )}

            <div className="mt-2 md:mt-8 lg:mt-12">
              {!authHydrated || (userId && isLoadingCart) ? (
                <CartItemSkeleton count={2} />
              ) : userId ? (
                flatItems.map((item) => (
                  <CartItemCard
                    cartServer={item}
                    key={item.id}
                  />
                ))
              ) : (
                localCart.map((item) => (
                  <CartItemCard
                    localProducts={item}
                    key={item.product_id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-span-12 md:col-span-5">
            <CartSummary
              total={total}
              onCheckout={proceedToCheckout}
              cart={cart}
              shipping={shippingCost}
              userId={userId ?? ""}
              authHydrated={authHydrated}
            />
          </div>
        </div>
      </div>
      <LoginDrawer
        openLogin={isLoginOpen}
        setOpenLogin={setIsLoginOpen}
        isCheckOut
        setUserId={setUserId}
      />
    </div>
  );
};

export default CartPageClient;
