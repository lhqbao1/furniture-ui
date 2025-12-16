import { ProductItem } from "@/types/products";
import { Clock, Info, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductDetailsLogisticProps {
  productDetails: ProductItem;
}

function getLatestInventory(inventory: any[]) {
  if (!inventory || inventory.length === 0) return null;

  return inventory.reduce((latest, item) => {
    if (!latest) return item;
    return new Date(item.date_received) > new Date(latest.date_received)
      ? item
      : latest;
  }, null);
}

function getDeliveryDayRange(
  deliveryTime?: string,
): { min: number; max: number } | null {
  if (!deliveryTime) return null;

  const parts = deliveryTime
    .split("-")
    .map((d) => Number(d.trim()))
    .filter((d) => !isNaN(d));

  if (parts.length === 1) {
    return { min: parts[0], max: parts[0] };
  }

  if (parts.length >= 2) {
    return {
      min: Math.min(...parts),
      max: Math.max(...parts),
    };
  }

  return null;
}

function formatDateDE(date: Date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function addBusinessDays(startDate: Date, businessDays: number) {
  const result = new Date(startDate);
  let addedDays = 0;

  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1);

    const day = result.getDay();
    // 0 = Sunday, 6 = Saturday → bỏ qua
    if (day !== 0 && day !== 6) {
      addedDays++;
    }
  }

  return result;
}

const ProductDetailsLogistic = ({
  productDetails,
}: ProductDetailsLogisticProps) => {
  const t = useTranslations();

  const latestInventory = React.useMemo(
    () => getLatestInventory(productDetails.inventory),
    [productDetails.inventory],
  );

  const deliveryDayRange = React.useMemo(
    () => getDeliveryDayRange(productDetails.delivery_time),
    [productDetails.delivery_time],
  );

  const estimatedDeliveryRange = React.useMemo(() => {
    if (!deliveryDayRange) return null;

    let startDate: Date | null = null;

    // CASE 1: hết hàng + có inventory
    if (productDetails.stock === 0 && latestInventory) {
      startDate = new Date(latestInventory.date_received);
    }

    // CASE 2: còn hàng
    if (productDetails.stock > 0) {
      startDate = new Date();
    }

    // CASE 3: stock = 0 & không inventory
    if (!startDate) return null;

    return {
      from: addBusinessDays(startDate, deliveryDayRange.min),
      to: addBusinessDays(startDate, deliveryDayRange.max),
    };
  }, [deliveryDayRange, productDetails.stock, latestInventory]);

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

      {/* <div>
        {t("inStock1")}: {productDetails.stock} Stück
      </div> */}

      <div className="flex flex-row gap-4 items-start py-1.5 lg:py-3">
        <Truck size={30} />
        <div>
          <p className="font-bold">
            {t("shippingCost", {
              shippingCost:
                productDetails.carrier === "amm" ? "35,95€" : "5,95€",
            })}{" "}
            inkl. MwSt.
          </p>
          <p className="text-gray-600">14-Tage-Rückgaberecht</p>
        </div>
      </div>

      <div className="flex flex-row gap-4 items-start  py-1.5 lg:py-3">
        <Clock size={30} />
        <div>
          <p className="font-bold">
            {estimatedDeliveryRange
              ? t("deliveryDateRange", {
                  from: formatDateDE(estimatedDeliveryRange.from),
                  to: formatDateDE(estimatedDeliveryRange.to),
                })
              : productDetails.delivery_time
              ? t("deliveryTime", {
                  days: productDetails.delivery_time,
                })
              : t("updating")}
          </p>

          <ul className="space-y-1 text-gray-600 text-sm">
            {productDetails.carrier === "amm" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-5">•</span>
                  <span className="text-base">
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
                  <span className="text-base leading-5">•</span>
                  <span className="text-base">
                    Speditionsversand nach Terminabsprache
                  </span>
                </li>
              </>
            )}

            <li className="flex items-start gap-2">
              <span className="text-base leading-5">•</span>
              <span className="text-base">Versand aus Deutschland</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsLogistic;
