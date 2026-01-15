import { CheckOutMain } from "@/types/checkout";
import React from "react";
import OrderStatusSelector from "./order-status-selector";
import { ArrowRight } from "lucide-react";
interface OrderDetailOverViewProps {
  created_at: string;
  updated_at: string;
  status: string;
  order: CheckOutMain;
}

const OrderDetailOverView = ({
  created_at,
  updated_at,
  status,
  order,
}: OrderDetailOverViewProps) => {
  return (
    <div className="space-y-1 col-span-1">
      <div className="flex gap-1 text-sm font-bold">
        <div>Order ID:</div>
        <div>{order.checkout_code}</div>
      </div>
      <div className="flex gap-1 text-sm font-bold">
        <div>Ext order:</div>
        <div>
          {order.marketplace_order_id ? order.marketplace_order_id : ""}
        </div>
      </div>
      <div className="flex gap-1 text-sm">
        <div>Created:</div>
        <div>{created_at}</div>
      </div>
      <div className="flex gap-1 text-sm">
        <div>Last update:</div>
        <div>{updated_at}</div>
      </div>
      <div className="flex gap-1 text-sm">
        <div>Payment Method:</div>
        <div
          translate="no"
          className="capitalize"
        >
          {order.from_marketplace
            ? `${order.from_marketplace} Managed Payments`
            : order.payment_method}
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <OrderStatusSelector
          order={order}
          status={status}
        />
      </div>
    </div>
  );
};

export default OrderDetailOverView;
