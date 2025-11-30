"use client";
import React, { useState } from "react";
import CartSummary from "@/components/layout/cart/cart-summary";
import CartTable from "@/components/layout/cart/cart-table";
import { LoginDrawer } from "@/components/shared/login-drawer";
import CartLocalTable from "@/components/layout/cart/cart-local-table";

import { CartActions, useCartData } from "@/hooks/cart/useCart";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";

const CartPageClient = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useAtom(userIdAtom);

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

  return (
    <div className="mt-6 lg:px-0 px-4">
      <div className="w-full lg:max-w-7xl mx-auto lg:p-6">
        <div className="grid grid-cols-12 xl:gap-16 gap-6">
          {/* Left: Cart Items */}
          {userId ? (
            <CartTable
              isLoadingCart={isLoadingCart}
              cart={cart ?? []}
              localQuantities={localQuantities}
              setLocalQuantities={setLocalQuantities}
              isCheckout={false}
            />
          ) : (
            <CartLocalTable
              data={localCart}
              onToggleItem={(product_id, is_active) =>
                updateStatus({ product_id, is_active })
              }
              onToggleAll={(is_active) => {
                localCart.forEach((item) =>
                  updateStatus({ product_id: item.product_id, is_active }),
                );
              }}
            />
          )}

          {/* Right: Summary */}
          <div className="col-span-12 md:col-span-4">
            <CartSummary
              total={total}
              onCheckout={proceedToCheckout}
              cart={cart}
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
