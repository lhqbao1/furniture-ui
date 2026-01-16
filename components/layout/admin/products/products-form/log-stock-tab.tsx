import { formatDateTimeString } from "@/lib/date-formated";
import { ProductItem } from "@/types/products";
import React from "react";

interface LogStockTabProps {
  productDetail: Partial<ProductItem>;
}

const LogStockTab = ({ productDetail }: LogStockTabProps) => {
  return (
    <div>
      <div className="text-lg font-semibold mb-4">
        Total: {productDetail.log_stocks?.length}
      </div>
      <div className="grid grid-cols-2 gap-6 border-b-2 border-gray-400 pb-1.5">
        <div className="grid grid-cols-5 gap-4 col-span-2">
          <div className="font-semibold uppercase">Created at:</div>
          <div className="font-semibold uppercase">Marketplace:</div>
          <div className="font-semibold uppercase">BackOrder:</div>
          <div className="font-semibold uppercase">Order ID:</div>
          <div className="font-semibold uppercase">Quantity:</div>
        </div>
        {/* <div className="grid grid-cols-2 col-span-1">
          <div className="font-semibold uppercase">User Email:</div>
          <div className="font-semibold uppercase">Updated at:</div>
        </div> */}
      </div>
      {productDetail.log_stocks?.map((item, index) => {
        return (
          <div
            key={item.id}
            className="grid grid-cols-2 gap-6 mt-1.5"
          >
            {item.main_checkout && (
              <div className="grid grid-cols-5 gap-4 col-span-2">
                <div className="text-sm">
                  {formatDateTimeString(item.created_at)}
                </div>
                <div className="text-sm">
                  {item.main_checkout
                    ? item.main_checkout.from_marketplace.toUpperCase()
                    : ""}
                </div>
                <div className="text-sm"></div>
                <div className="text-sm">
                  {item.main_checkout ? item.main_checkout.checkout_code : ""}
                </div>
                <div className="text-sm">{item.quantity}</div>
              </div>
            )}
            {/* {item.user && (
              <div className="grid grid-cols-2 col-span-1">
                <div>{item.user ? item.user.email : ""}</div>
                <div>{formatDateTimeString(item.created_at)}</div>
              </div>
            )} */}
          </div>
        );
      })}
    </div>
  );
};

export default LogStockTab;
