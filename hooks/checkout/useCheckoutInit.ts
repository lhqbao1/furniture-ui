// hooks/checkout/useCheckoutInit.ts
"use client";

import { useEffect, useState } from "react";
import { useCartLocal } from "@/hooks/cart";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";
import { getUserById } from "@/features/users/api";
import {
  getAddressByUserId,
  getInvoiceAddressByUserId,
} from "@/features/address/api";
import { getCartItems } from "@/features/cart/api";
import {
  calculateShipping,
  checkShippingType,
  normalizeCartItems,
} from "@/hooks/caculate-shipping";

export function useCheckoutInit() {
  const [userLoginId, setUserLoginId] = useState<string>(""); // user đăng nhập thật
  const [userGuestId, setUserGuestId] = useState<string>(""); // user tạo trong checkout

  // Load from localStorage only on client
  useEffect(() => {
    const loginId = localStorage.getItem("userId"); // user login thật
    const guestId = localStorage.getItem("userIdGuest"); // user đăng ký trong checkout

    if (loginId) setUserLoginId(loginId);
    if (guestId) setUserGuestId(guestId);
  }, []);

  const finalUserId = userLoginId || userGuestId;

  const { data: user } = useQuery<User>({
    queryKey: ["user", finalUserId],
    queryFn: () => getUserById(finalUserId ?? ""),
    enabled: !!finalUserId,
    retry: false,
  });

  const { data: addresses } = useQuery({
    queryKey: ["address-by-user", userLoginId],
    queryFn: () => getAddressByUserId(userLoginId ?? ""),
    enabled: !!userLoginId,
    retry: false,
  });

  const { data: invoiceAddress } = useQuery({
    queryKey: ["invoice-address-by-user", userLoginId],
    queryFn: () => getInvoiceAddressByUserId(userLoginId ?? ""),
    enabled: !!userLoginId,
    retry: false,
  });

  // Cart
  const { cart: localCart } = useCartLocal();

  const { data: cartItems, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart-items", userLoginId], // chỉ login user mới có cart server
    queryFn: async () => {
      const response = await getCartItems();
      return [...response].sort((a, b) => {
        const latestA = Math.max(
          ...a.items.map((i) => new Date(i.created_at).getTime()),
        );
        const latestB = Math.max(
          ...b.items.map((i) => new Date(i.created_at).getTime()),
        );
        return latestB - latestA;
      });
    },

    // ⭐ ONLY CALL WHEN REAL LOGIN EXISTS
    enabled: !!finalUserId,
    retry: false,
  });

  const hasServerCart = Array.isArray(cartItems) && cartItems.length > 0;

  const normalized = normalizeCartItems(
    hasServerCart ? cartItems.flatMap((g) => g.items) : localCart,
    hasServerCart,
  );

  const shippingCost = calculateShipping(normalized);
  const hasOtherCarrier = checkShippingType(normalized);
  const totalAmount = 1;

  return {
    user,
    addresses,
    invoiceAddress,
    cartItems,
    localCart,
    isLoadingCart,
    hasServerCart,
    shippingCost,
    hasOtherCarrier,
    userGuestId,
    setUserGuestId,
    userLoginId,
    setUserLoginId,
    finalUserId,
    totalAmount,
  };
}
