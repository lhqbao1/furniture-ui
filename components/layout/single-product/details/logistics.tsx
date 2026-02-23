import { ProductItem } from "@/types/products";
import { Truck, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import Link from "next/link";
import DeliveryRange from "./delivery-range";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

interface ProductDetailsLogisticProps {
  productDetails: ProductItem;
}

const ProductDetailsLogistic = ({
  productDetails,
}: ProductDetailsLogisticProps) => {
  const t = useTranslations();

  const carrier = productDetails?.carrier?.toLowerCase();

  const isSpedition = carrier === "amm" || carrier === "spedition";

  const shippingCost = isSpedition ? "35,95€" : "5,95€";
  const availableStock = calculateAvailableStock(productDetails);

  return (
    <div className="space-y-2">
      {/* <div>{t("includeVatAndShipping")}</div> */}
      <div className="flex gap-2 py-0 lg:py-3 items-center ">
        <div>{availableStock <= 0 ? t("outStock") : t("inStock")}:</div>
        <div className="grid grid-cols-3 w-1/3 gap-1">
          <span
            className={`w-full h-2 rounded-xs ${
              availableStock <= 0
                ? "bg-gray-300"
                : availableStock < 10
                  ? "bg-red-500"
                  : availableStock <= 20
                    ? "bg-primary"
                    : "bg-secondary"
            }`}
          />

          <span
            className={`w-full h-2 rounded-xs ${
              availableStock <= 0
                ? "bg-gray-300"
                : availableStock < 10
                  ? "bg-gray-300"
                  : availableStock <= 20
                    ? "bg-primary"
                    : "bg-secondary"
            }`}
          />

          <span
            className={`w-full h-2 rounded-xs ${
              availableStock <= 0
                ? "bg-gray-300"
                : availableStock < 10
                  ? "bg-gray-300"
                  : availableStock <= 20
                    ? "bg-gray-400"
                    : "bg-secondary"
            }`}
          />
        </div>
      </div>

      {/* <ShippingDrawer productDetails={productDetails} /> */}
      <Link
        href={"https://www.prestige-home.de/de/versandbedingungen"}
        className="flex flex-row gap-4 items-center"
      >
        <Truck size={25} aria-hidden="true" />
        <span className="text-gray-800 font-medium text-sm cursor-pointer hover:underline">
          {t("shippingCost", { shippingCost })}
        </span>
      </Link>

      <DeliveryRange productDetails={productDetails} />

      <div className="flex flex-row gap-4 items-center">
        <Undo2 size={25} aria-hidden="true" />
        <Link
          href={"https://www.prestige-home.de/de/widerrufsbelehrung"}
          className="text-gray-800 font-medium text-sm hover:underline"
        >
          14-Tage-Rückgaberecht
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailsLogistic;
