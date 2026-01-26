"use client";

import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShippingDrawerProps {
  productDetails: ProductItem;
}

const ShippingDrawer = ({ productDetails }: ShippingDrawerProps) => {
  const t = useTranslations();
  const carrier = productDetails?.carrier?.toLowerCase();

  const isSpedition = carrier === "amm" || carrier === "spedition";

  const shippingCost = isSpedition ? "35,95€" : "5,95€";

  return (
    <Drawer direction="right">
      <DrawerTrigger>
        <div className="flex flex-row gap-4 items-center">
          <Truck size={25} />
          <span className="text-gray-800 font-medium text-sm cursor-pointer hover:underline">
            {t("shippingCost", { shippingCost })}
          </span>
        </div>
      </DrawerTrigger>
      <DrawerContent className="p-6 w-[500px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[500px] mx-auto">
        <DrawerHeader className="px-0 pb-4">
          <DrawerTitle className="text-[20px] font-semibold text-center">
            Versandkosten
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-8 text-[14px] text-gray-800">
          {/* Intro */}
          <p>
            Für jede Bestellung berechnen wir nur eine einmalige
            Versandkostenpauschale - unabhängig von Bestellwert oder Anzahl der
            bestellten Produkte.
          </p>

          {/* Logistikzuschläge */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Paketversand:</span>
              <span>5,95 €</span>
            </div>

            <div className="flex justify-between">
              <span>Speditionsversand:</span>
              <span>35,95 €</span>
            </div>
          </div>

          {/* Small details */}
          <p className="text-gray-500 text-[12px] leading-4">
            *Bestellen Sie Artikel aus unterschiedlichen Versandkategorien (z.
            B. Paket- und Speditionsware), wird ausschließlich die
            Speditionspauschale berechnet. Es fallen also keine zusätzlichen
            Paketkosten an.
          </p>
        </div>

        {/* <DrawerFooter className="pt-8">
          <DrawerClose asChild>
            <Button
              variant="secondary"
              className="w-full"
            >
              Schließen
            </Button>
          </DrawerClose>
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
};

export default ShippingDrawer;
