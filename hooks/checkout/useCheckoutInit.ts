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
  const [userId, setUserId] = useState("");
  const [userIdLogin, setUserIdLogin] = useState("");

  // Load from localStorage only on client
  useEffect(() => {
    const storedId = localStorage.getItem("userIdGuest");
    const storedLogin = localStorage.getItem("userId");
    if (storedLogin) setUserIdLogin(storedLogin);
    if (storedId) setUserId(storedId);
  }, []);

  const finalUserId = userIdLogin || userId;

  const { data: user } = useQuery<User>({
    queryKey: ["user", finalUserId],
    queryFn: () => getUserById(finalUserId),
    enabled: !!finalUserId,
    retry: false,
  });

  const { data: addresses } = useQuery({
    queryKey: ["address-by-user", finalUserId],
    queryFn: () => getAddressByUserId(finalUserId),
    enabled: !!finalUserId,
    retry: false,
  });

  const { data: invoiceAddress } = useQuery({
    queryKey: ["invoice-address-by-user", finalUserId],
    queryFn: () => getInvoiceAddressByUserId(finalUserId),
    enabled: !!finalUserId,
    retry: false,
  });

  // Cart
  const { cart: localCart } = useCartLocal();
  const { data: cartItems, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart-items", finalUserId],
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
    userId,
    setUserId,
    userIdLogin,
    setUserIdLogin,
    totalAmount,
  };
}
