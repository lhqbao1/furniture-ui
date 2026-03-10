import React from "react";
import CartPageClient from "./page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warenkorb",
  description:
    "Ihr aktueller Warenkorb bei Prestige Home. Diese Seite ist nicht indexierbar.",
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
