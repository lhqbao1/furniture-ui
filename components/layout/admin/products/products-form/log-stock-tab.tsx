import { formatDateTimeString } from "@/lib/date-formated";
import { ProductItem } from "@/types/products";
import React from "react";

interface LogStockTabProps {
  productDetail: Partial<ProductItem>;
}

const LogStockTab = ({ productDetail }: LogStockTabProps) => {
  return (
    <div className="overflow-x-auto">
      <div className="w-max min-w-full">
        <div className="text-lg font-semibold mb-4">
          Total: {productDetail.log_stocks?.length}
        </div>
        <div className="grid grid-cols-[minmax(220px,auto)_minmax(160px,auto)_minmax(140px,auto)_minmax(180px,auto)_minmax(160px,auto)_minmax(220px,auto)_minmax(240px,auto)] gap-x-8 gap-y-1.5 whitespace-nowrap">
          <div className="font-semibold uppercase">Created at:</div>
          <div className="font-semibold uppercase">Marketplace:</div>
          <div className="font-semibold uppercase">BackOrder:</div>
          <div className="font-semibold uppercase">Order ID:</div>
          <div className="font-semibold uppercase">Quantity:</div>
          <div className="font-semibold uppercase">User:</div>
          <div className="font-semibold uppercase">Note:</div>
          <div className="col-span-7 border-b-2 border-gray-400 mb-1.5" />

          {productDetail.log_stocks?.map((item) => (
            <React.Fragment key={item.id}>
              <div className="text-sm">
                {formatDateTimeString(item.created_at)}
              </div>
              <div className="text-sm">
                {item.main_checkout?.from_marketplace
                  ? item.main_checkout.from_marketplace.toUpperCase()
                  : "Prestige Home"}
              </div>
              <div className="text-sm"></div>
              <div className="text-sm">
                {item.main_checkout ? item.main_checkout.checkout_code : ""}
              </div>
              <div className="text-sm">
                {item.quantity ? item.quantity : ""} (
                {item.current_stock ? item.current_stock : "-"})
              </div>
              <div className="text-sm">{item.user ? item.user.email : ""}</div>
              <div className="text-sm">{item.note ? item.note : "hehe"}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogStockTab;
