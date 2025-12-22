import React from "react";
import CheckOutPageClient from "./page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const CartPage = () => {
  return <CheckOutPageClient />;
};

export default CartPage;
