import { CheckOutMain } from "@/types/checkout";
import React from "react";
import OrderStatusSelector from "./order-status-selector";
import { Hash, ReceiptText, Store, WalletCards } from "lucide-react";
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
  const rawChannel = order.from_marketplace?.trim();
  const channelLabel = rawChannel ? rawChannel.toUpperCase() : "Prestige Home";

  return (
    <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Order Overview
        </h3>
        <Store className="size-4 text-slate-500" />
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-500">Channel</div>
          <div className="font-semibold text-slate-900">
            {channelLabel}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <Hash className="size-3.5" />
            <span>Order ID</span>
          </div>
          <div className="font-semibold text-slate-900">{order.checkout_code}</div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <ReceiptText className="size-3.5" />
            <span>Ext order</span>
          </div>
          <div className="font-medium text-slate-700">
            {order.marketplace_order_id ? order.marketplace_order_id : "-"}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-500">Created</div>
          <div className="text-slate-700">{created_at}</div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-500">Last update</div>
          <div className="text-slate-700">{updated_at}</div>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <WalletCards className="size-3.5 mt-0.5" />
            <span>Payment Method</span>
          </div>
          <div translate="no" className="text-right capitalize text-slate-700">
          {order.from_marketplace &&
          order.from_marketplace.toLowerCase() !== "econelo"
            ? `${order.from_marketplace} Managed Payments`
            : order.payment_method}
          </div>
        </div>
      </div>

      <div className="pt-1">
        <OrderStatusSelector order={order} status={status} />
      </div>
    </div>
  );
};

export default OrderDetailOverView;
