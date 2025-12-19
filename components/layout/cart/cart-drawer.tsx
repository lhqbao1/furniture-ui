"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import { getCartItems } from "@/features/cart/api";
import { useCartLocal } from "@/hooks/cart";
import CartPage from "@/src/app/[locale]/(payment)/cart/page-client";
import { userIdAtom } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ShoppingCart, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function CartDrawer() {
  const [openCart, setOpenCart] = useState(false);

  const t = useTranslations();
  const [userId] = useAtom(userIdAtom);
  const { cart: localCart } = useCartLocal();

  const { data: cart } = useQuery({
    queryKey: ["cart-items", userId],
    queryFn: getCartItems,
    enabled: !!userId,
  });
  const displayedCart = userId
    ? cart?.reduce((count, group) => count + group.items.length, 0) ?? 0
    : localCart.length;
  return (
    <Drawer
      open={openCart}
      onOpenChange={setOpenCart}
      direction="left"
    >
      <DrawerTrigger asChild>
        <div className="relative">
          <ShoppingCart
            stroke="#4D4D4D"
            size={30}
            className="hover:scale-110 transition-all duration-300"
          />
          {displayedCart && displayedCart > 0 ? (
            <span className="absolute -top-1.5 -right-1 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
            </span>
          ) : null}
        </div>
      </DrawerTrigger>

      <DrawerContent className="w-full h-full px-4 flex flex-col p-0 data-[vaul-drawer-direction=left]:w-full duration-500 overflow-y-scroll">
        <DrawerTitle className="border-b-2 p-4 flex justify-between">
          <div className="uppercase font-bold text-xl">{t("cart")}</div>
          <DrawerClose>
            <X />
          </DrawerClose>
        </DrawerTitle>
        <DrawerDescription></DrawerDescription>
        <CartPage />
      </DrawerContent>
    </Drawer>
  );
}
