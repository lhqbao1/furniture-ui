import React from "react";
import CheckOutPageClient from "./page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Sicherer Bestellabschluss bei Prestige Home. Diese Seite ist nicht indexierbar.",
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
