import { ProductItem } from "@/types/products";
import { Clock, Info, ShieldCheckIcon, Truck, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeliveryEstimate } from "@/hooks/get-estimated-shipping";
import { formatDateDE } from "@/lib/format-date-DE";
import Link from "next/link";
import ShippingDrawer from "../shipping-drawer";

interface ProductDetailsLogisticProps {
  productDetails: ProductItem;
}

const ProductDetailsLogistic = ({
  productDetails,
}: ProductDetailsLogisticProps) => {
  const t = useTranslations();

  const estimatedDeliveryRange = useDeliveryEstimate({
    stock: productDetails.stock - (productDetails.result_stock ?? 0),
    inventory: productDetails.inventory,
    deliveryTime: productDetails.delivery_time,
  });

  const carrier = productDetails?.carrier?.toLowerCase();

  const isSpedition = carrier === "amm" || carrier === "spedition";

  const shippingCost = isSpedition ? "35,95€" : "5,95€";

  return (
    <div className="space-y-2">
      {/* <div>{t("includeVatAndShipping")}</div> */}
      <div className="flex gap-2 py-0 lg:py-3 items-center ">
        <div>{t("inStock")}:</div>
        <div className="grid grid-cols-3 w-1/3 gap-1">
          <span
            className={`w-full h-2 rounded-xs ${
              productDetails.stock === 0
                ? "bg-gray-300"
                : productDetails.stock < 10
                  ? "bg-red-500"
                  : productDetails.stock <= 20
                    ? "bg-primary"
                    : "bg-secondary"
            }`}
          />

          <span
            className={`w-full h-2 rounded-xs ${
              productDetails.stock === 0
                ? "bg-gray-300"
                : productDetails.stock < 10
                  ? "bg-gray-300"
                  : productDetails.stock <= 20
                    ? "bg-primary"
                    : "bg-secondary"
            }`}
          />

          <span
            className={`w-full h-2 rounded-xs ${
              productDetails.stock === 0
                ? "bg-gray-300"
                : productDetails.stock < 10
                  ? "bg-gray-300"
                  : productDetails.stock <= 20
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
        <Truck size={25} />
        <span className="text-gray-800 font-medium text-sm cursor-pointer hover:underline">
          {t("shippingCost", { shippingCost })}
        </span>
      </Link>

      <div className="flex flex-row gap-4 items-start">
        <Clock
          size={25}
          className="mt-1.5"
        />
        <div>
          <span className="text-gray-800 font-medium text-sm">
            {estimatedDeliveryRange ? (
              <>
                {t.rich("deliveryDateRange", {
                  from: formatDateDE(estimatedDeliveryRange.from),
                  to: formatDateDE(estimatedDeliveryRange.to),
                  b: (chunks) => <strong>{chunks}</strong>,
                })}
              </>
            ) : productDetails.delivery_time ? (
              t("deliveryTime", {
                days: productDetails.delivery_time,
              })
            ) : (
              t("updating")
            )}
          </span>

          <ul className="space-y-1 text-gray-600 text-sm">
            {(() => {
              const carrier = productDetails?.carrier?.toLowerCase();

              if (carrier !== "amm" && carrier !== "spedition") return null;

              return (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-sm leading-5">•</span>
                    <span className="text-sm text-gray-800">
                      Lieferung <strong>frei Bordsteinkante</strong>{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="inline-block w-3.5 h-3.5 text-gray-500 ml-1 mb-0.5" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-secondary">
                          <p className="text-white text-sm">
                            „Frei Bordsteinkante“ bedeutet: Lieferung bis zur
                            Grundstücksgrenze – kein Transport ins Haus oder zur
                            Wohnung.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="text-sm leading-5">•</span>
                    <span className="text-sm text-gray-800">
                      Speditionsversand nach Terminabsprache
                    </span>
                  </li>
                </>
              );
            })()}
          </ul>
        </div>
      </div>

      <div className="flex flex-row gap-4 items-center">
        <Undo2 size={25} />
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
