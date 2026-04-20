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
    <div className="min-h-screen w-full py-8 space-y-6">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-secondary/15 bg-gradient-to-r from-secondary/10 via-background to-secondary/5 px-6 py-8 shadow-sm">
        <h1 className="section-header mb-2">{t("myOrder")}</h1>
        <p className="text-center text-sm text-muted-foreground">
          Verwalten Sie Ihre Bestellungen, Sendungen und Rechnungen an einem
          Ort.
        </p>
      </div>
      <OrderList />
    </div>
  );
};

export default MyOrder;
