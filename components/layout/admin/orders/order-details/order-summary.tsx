import { User } from "@/types/user";
import React from "react";

interface OrderInformationProps {
  payment_method?: string;
  language: string;
  external_id?: string;
  warehouse?: string;
  referrer?: string;
  owner?: User;
  order_type?: string;
  shipping_profile?: string;
  package_number?: string;
  entry_date?: Date;
  client?: string;
  sub_total?: number;
  shipping_amount?: number;
  discount_amount?: number;
  tax?: number;
  total_amount?: number;
  is_Ebay?: boolean;
}

const OrderSummary = ({
  payment_method,
  language,
  external_id,
  warehouse,
  referrer,
  owner,
  order_type,
  shipping_profile,
  package_number,
  entry_date,
  client,
  sub_total,
  shipping_amount,
  discount_amount,
  tax,
  total_amount,
  is_Ebay = false,
}: OrderInformationProps) => {
  return (
    <div className="flex flex-col w-full items-end space-y-3">
      <div className="grid grid-cols-3 lg:w-1/4 w-1/2">
        <div className="text-end col-span-2">Sub total</div>
        <div className="text-end">
          €
          {sub_total?.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 lg:w-1/4 w-1/2">
        <div className="text-end col-span-2">Shipping</div>
        <div className="text-end">
          €
          {(shipping_amount ?? 0)?.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 lg:w-1/4 w-1/2">
        <div className="text-end col-span-2">Discount</div>
        <div className="text-end">
          €
          {discount_amount?.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 lg:w-1/4 w-1/2">
        <div className="text-end col-span-2">VAT</div>
        <div className="text-end">
          €
          {tax?.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="text-end text-xl text-primary font-bold">
        <div className="">
          Total €
          {total_amount?.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
