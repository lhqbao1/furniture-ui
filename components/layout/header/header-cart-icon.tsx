"use client";
import { getCartItems } from "@/features/cart/api";
import { useCartLocal } from "@/hooks/cart";
import { Link } from "@/src/i18n/navigation";
import { userIdAtom } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { ShoppingCart } from "lucide-react";
import React from "react";

const HeaderCartIcon = () => {
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
    <Link
      href={`/cart`}
      className={`cursor-pointer relative`}
      aria-label="Go to cart"
    >
      <ShoppingCart
        stroke={`#4D4D4D`}
        className="hover:scale-110 transition-all duration-300 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
      />
      {/* {displayedCart && displayedCart > 0 ? (
        <span className="absolute -top-1.5 -right-1 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
        </span>
      ) : (
        ""
      )} */}
      {displayedCart > 0 && (
        <span className="absolute -top-2 -right-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative flex items-center justify-center min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] md:text-[10px] font-semibold">
            {displayedCart > 99 ? "99+" : displayedCart}
          </span>
        </span>
      )}
    </Link>
  );
};

export default HeaderCartIcon;
