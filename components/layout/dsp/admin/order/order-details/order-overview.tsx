import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatDateTimeString } from "@/lib/date-formated";
import { CheckOut } from "@/types/checkout";
import React from "react";

interface OrderOverviewSupplierProps {
  order: CheckOut;
}

const OrderOverviewSupplier = ({ order }: OrderOverviewSupplierProps) => {
  return (
    <Card className="h-full">
      <CardTitle className="px-6 text-secondary text-xl">Order</CardTitle>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm">Purchase Date</p>
            <p className="text-sm font-semibold">
              {formatDateTimeString(order.created_at)}
            </p>
          </div>

          <div>
            <p className="text-sm">Purchase Order No.</p>
            <p className="text-sm font-semibold">{order.checkout_code}</p>
          </div>

          <div>
            <p className="text-sm">Customer Name</p>
            <p className="text-sm font-semibold">
              {order.user.company_name
                ? order.user.company_name
                : order.invoice_address.recipient_name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderOverviewSupplier;
