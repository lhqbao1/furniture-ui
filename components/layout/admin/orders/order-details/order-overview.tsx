import { CheckOut, CheckOutMain } from "@/types/checkout";
import { ArrowRight, ChevronDown } from "lucide-react";
import React from "react";
import ReturnConfirmDialog from "../order-list/return-confirm-dialog";
import CancelConfirmDialog from "../order-list/canceled-confirm-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderStatusSelector from "./order-status-selector";
interface OrderDetailOverViewProps {
  created_at: string;
  updated_at: string;
  status: string;
  order: CheckOutMain;
}

function getReadableStatus(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "Waiting for payment";
    case "paid":
      return "Payment received";
    case "stock_reserved":
      return "Stock reserved";
    case "preparation_shipping":
      return "In preparation for shipping";
    case "ds_informed":
      return "DS informed";
    case "shipped":
      return "Dispatched";
    case "completed":
      return "Completed";
    case "cancel_request":
      return "Cancel requested";
    case "canceled":
      return "Canceled";
    case "return":
      return "Return";
    default:
      return status; // fallback
  }
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
      <div className="space-y-2 mt-2">
        <OrderStatusSelector
          order={order}
          status={status}
        />
        <div className="flex items-center justify-between text-sm py-1 px-2 border rounded-md font-bold cursor-pointer">
          <div className="flex gap-1">
            <div>Chanel:</div>
            <div
              translate="no"
              className="capitalize"
            >
              {order.from_marketplace ?? "Prestige Home"}
            </div>
          </div>
          <ArrowRight size={16} />
        </div>
        <div className="flex items-center justify-between text-sm py-1 px-2 border rounded-md font-bold cursor-pointer">
          <div className="flex gap-1">
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
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailOverView;
