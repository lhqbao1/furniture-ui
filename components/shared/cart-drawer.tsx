"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useTranslations } from "next-intl";
import CartTitleSkeleton from "../layout/cart/skeleton/cart-page-heading-skeleton";
import CartItemSkeleton from "../layout/cart/skeleton/cart-item-card-skeleton";
import CartItemCard from "../layout/cart/cart-item";
import { useAtom } from "jotai";
import { authHydratedAtom, userIdAtom } from "@/store/auth";
import { useCartData } from "@/hooks/cart/useCart";
import { CartItem, CartResponseItem } from "@/types/cart";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function flattenCartItems(carts: CartResponseItem[]): CartItem[] {
  return carts.flatMap((cart) => cart.items);
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const t = useTranslations();
  const [userId, setUserId] = useAtom(userIdAtom);
  const [authHydrated] = useAtom(authHydratedAtom);

  const { cart, localCart, isLoadingCart } = useCartData();

  const flatItems = flattenCartItems(cart ?? []);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-[800px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[800px]  overflow-y-auto overflow-x-hidden">
        {/* HEADER */}
        <DrawerHeader className="border-b">
          {!authHydrated || (userId && isLoadingCart) ? (
            <CartTitleSkeleton />
          ) : (
            <DrawerTitle className="text-3xl font-normal">
              Warenkorb{" "}
              <span className="mb-6 capitalize">
                (
                {userId
                  ? (cart?.reduce((acc, g) => acc + g.items.length, 0) ?? 0)
                  : localCart.length}{" "}
                <span className="capitalize">{t("items")}</span>)
              </span>
            </DrawerTitle>
          )}
        </DrawerHeader>

        {/* BODY */}
        <div className="overflow-y-auto h-[calc(100vh-96px)] p-6">
          {!authHydrated || (userId && isLoadingCart) ? (
            <CartItemSkeleton count={2} />
          ) : userId ? (
            flatItems.map((item) => (
              <CartItemCard cartServer={item} key={item.id} />
            ))
          ) : (
            localCart.map((item) => (
              <CartItemCard localProducts={item} key={item.product_id} />
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
