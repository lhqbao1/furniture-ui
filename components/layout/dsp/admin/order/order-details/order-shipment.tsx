import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatDateTimeString } from "@/lib/date-formated";
import { CheckOut } from "@/types/checkout";
import React from "react";

interface OrderDetailsShipmentSupplierProps {
  order: CheckOut;
}

const OrderDetailsShipmentSupplier = ({
  order,
}: OrderDetailsShipmentSupplierProps) => {
  return (
    <Card className="h-full">
      <CardTitle className="px-6 text-secondary text-xl">Shipment</CardTitle>
      <CardContent>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm">Country</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.country}
            </p>
          </div>

          <div>
            <p className="text-sm">City</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.city}
            </p>
          </div>

          <div>
            <p className="text-sm">Postal Code</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.postal_code}
            </p>
          </div>

          <div>
            <p className="text-sm">Address</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.address_line}
            </p>
          </div>

          <div>
            <p className="text-sm">Address 2</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.additional_address_line}
            </p>
          </div>

          <div>
            <p className="text-sm">Ship to email</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.email ?? ""}
            </p>
          </div>

          <div>
            <p className="text-sm">Phone</p>
            <p className="text-sm font-semibold">
              {order.shipping_address.phone_number ?? ""}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsShipmentSupplier;
