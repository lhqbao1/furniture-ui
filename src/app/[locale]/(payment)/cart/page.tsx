import React from "react";
import CartPageClient from "./page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const CartPage = () => {
  return <CartPageClient />;
};

export default CartPage;
