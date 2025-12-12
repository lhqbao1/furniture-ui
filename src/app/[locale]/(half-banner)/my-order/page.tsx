import OrderList from "@/components/layout/my-order/order-list";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import React from "react";

export const metadata: Metadata = {
  title: "Meine Bestellungen – Prestige Home",
  description:
    "Sehen Sie Ihre Bestellhistorie sicher in Ihrem Prestige Home Konto ein.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const MyOrder = () => {
  const t = useTranslations();
  return (
    <div className="min-h-screen overflow-scroll w-full py-8 space-y-6">
      <h1 className="section-header">{t("myOrder")}</h1>
      <OrderList />
    </div>
  );
};

export default MyOrder;
