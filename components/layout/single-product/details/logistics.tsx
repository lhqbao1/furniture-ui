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

const ProductDetailsLogistic = ({
  productDetails,
}: ProductDetailsLogisticProps) => {
  const t = useTranslations();
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

      <div className="flex flex-row gap-4 items-start py-1.5 lg:py-3">
        <Truck size={30} />
        <div>
          <p className="font-bold">
            {t("shippingCost", {
              shippingCost:
                productDetails.carrier === "amm" ? "35,95€" : "5,95€",
            })}
          </p>
          <p className="text-gray-600">14-Tage-Rückgaberecht</p>
        </div>
      </div>

      <div className="flex flex-row gap-4 items-start  py-1.5 lg:py-3">
        <Clock size={30} />
        <div>
          <p className="font-bold">
            {productDetails.delivery_time
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
