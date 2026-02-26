"use client";
import {
  addBusinessDays,
  getDeliveryDayRange,
} from "@/hooks/get-estimated-shipping";
import { formatDateDE } from "@/lib/format-date-DE";
import { InventoryItem, ProductItem } from "@/types/products";
import { Clock, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInventoryPoByProductId } from "@/features/incoming-inventory/inventory/hook";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

interface DeliveryRangeProps {
  productDetails: ProductItem;
  available_stock: number;
}

const DeliveryRange = ({
  productDetails,
  available_stock,
}: DeliveryRangeProps) => {
  const t = useTranslations();
  const { data, isLoading, isError } = useInventoryPoByProductId(
    productDetails.id,
  );
  const currentStock = React.useMemo(
    () => calculateAvailableStock(productDetails),
    [productDetails],
  );

  const nextIncomingDate = React.useMemo(() => {
    const today = new Date();
    const candidates: Date[] = [];

    const poItems = Array.isArray(data) ? data : data ? [data] : [];
    for (const item of poItems) {
      if (!item?.list_delivery_date) continue;
      const date = new Date(item.list_delivery_date);
      if (!Number.isNaN(date.getTime())) candidates.push(date);
    }

    if (candidates.length === 0) return null;

    const futureDates = candidates.filter((date) => date >= today);
    if (futureDates.length > 0) {
      return futureDates.sort((a, b) => a.getTime() - b.getTime())[0];
    }

    return candidates.sort((a, b) => b.getTime() - a.getTime())[0];
  }, [data]);

  const addCalendarDays = React.useCallback((startDate: Date, days: number) => {
    const result = new Date(startDate);
    result.setDate(result.getDate() + days);
    return result;
  }, []);

  const estimatedDeliveryRange = React.useMemo(() => {
    const deliveryRange = getDeliveryDayRange(productDetails.delivery_time);
    if (!deliveryRange) return null;

    if (currentStock > 0) {
      const today = new Date();
      return {
        from: addCalendarDays(today, deliveryRange.min),
        to: addCalendarDays(today, deliveryRange.max),
      };
    }

    if (!nextIncomingDate) {
      const today = new Date();
      return {
        from: addCalendarDays(today, deliveryRange.min),
        to: addCalendarDays(today, deliveryRange.max),
      };
    }

    return {
      from: addBusinessDays(nextIncomingDate, deliveryRange.min),
      to: addBusinessDays(nextIncomingDate, deliveryRange.max),
    };
  }, [
    addCalendarDays,
    currentStock,
    nextIncomingDate,
    productDetails.delivery_time,
  ]);

  return (
    <div className="flex flex-row gap-4 items-start">
      <Clock size={25} className="mt-1.5" />
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
  );
};

export default DeliveryRange;
