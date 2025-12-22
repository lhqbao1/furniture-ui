"use client";
import React, { useState } from "react";
import CartSummary from "@/components/layout/cart/cart-summary";
import CartTable from "@/components/layout/cart/cart-table";
import { LoginDrawer } from "@/components/shared/login-drawer";
import CartLocalTable from "@/components/layout/cart/cart-local-table";

import { CartActions, useCartData } from "@/hooks/cart/useCart";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import CartItemCard from "@/components/layout/cart/cart-item";
import { CartItem, CartResponseItem } from "@/types/cart";
import { useTranslations } from "next-intl";
import {
  calculateShipping,
  normalizeCartItems,
} from "@/hooks/caculate-shipping";

function flattenCartItems(carts: CartResponseItem[]): CartItem[] {
  return carts.flatMap((cart) => cart.items);
}

const CartPageClient = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useAtom(userIdAtom);
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
    <div className="mt-6 lg:px-0 px-4 container-padding overflow-auto">
      <div className="w-full lg:max-w-7xl mx-auto lg:p-6">
        <div className="grid grid-cols-12 lg:gap-16 gap-6">
          {/* Left: Cart Items */}
          <div className="col-span-12 md:col-span-7">
            <h3 className="text-3xl font-normal">
              Warenkorb{" "}
              <span className="mb-6 capitalize">
                (
                {userId ? (
                  <>
                    {cart
                      ? cart.reduce((acc, group) => acc + group.items.length, 0)
                      : 0}{" "}
                  </>
                ) : (
                  localCart.length
                )}{" "}
                <span className="capitablize">{t("items")}</span>)
              </span>
            </h3>
            <div className="mt-12">
              {
                userId
                  ? flatItems.map((items, index) => {
                      return (
                        <CartItemCard
                          cartServer={items}
                          key={items.id}
                        />
                      );
                    })
                  : localCart.map((item, index) => {
                      return (
                        <CartItemCard
                          localProducts={item}
                          key={item.product_id}
                        />
                      );
                    })
                // <CartTable
                //   isLoadingCart={isLoadingCart}
                //   cart={cart ?? []}
                //   localQuantities={localQuantities}
                //   setLocalQuantities={setLocalQuantities}
                //   isCheckout={false}
                // />
                // <CartLocalTable
                //   data={localCart}
                //   onToggleItem={(product_id, is_active) =>
                //     updateStatus({ product_id, is_active })
                //   }
                //   onToggleAll={(is_active) => {
                //     localCart.forEach((item) =>
                //       updateStatus({ product_id: item.product_id, is_active }),
                //     );
                //   }}
                // />
              }
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-span-12 md:col-span-5">
            <CartSummary
              total={total}
              onCheckout={proceedToCheckout}
              cart={cart}
              shipping={shippingCost}
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
