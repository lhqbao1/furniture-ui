"use client";
import { CartItemLocal } from "@/lib/utils/cart";
import { CartResponseItem } from "@/types/cart";
import React, { useState } from "react";
import CartTable from "../cart/cart-table";
import CartLocalTable from "../cart/cart-local-table";
import { useCartLocal } from "@/hooks/cart";

interface CheckoutProductsProps {
  cartItems: CartResponseItem[];
  localCart: CartItemLocal[];
  isLoadingCart: boolean;
}

const CheckoutProducts = ({
  cartItems,
  localCart,
  isLoadingCart,
}: CheckoutProductsProps) => {
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});

  const { updateStatus } = useCartLocal();

  return (
    <>
      {cartItems && cartItems.length > 0 ? (
        <CartTable
          isLoadingCart={isLoadingCart}
          cart={
            cartItems
              ? cartItems.map((g) => ({
                  ...g,
                  items: g.items.filter((i) => i.is_active),
                }))
              : undefined
          }
          localQuantities={localQuantities}
          setLocalQuantities={setLocalQuantities}
          isCheckout
        />
      ) : (
        <CartLocalTable
          data={localCart}
          onToggleItem={(pid, active) =>
            updateStatus({ product_id: pid, is_active: active })
          }
          onToggleAll={(active) =>
            localCart.forEach((item) =>
              updateStatus({
                product_id: item.product_id,
                is_active: active,
              }),
            )
          }
          isCheckout
        />
      )}
    </>
  );
};

export default CheckoutProducts;
