import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import React from "react";
import OrderStatusFilter from "./filter-order-status";
import OrderChanelFilter from "./filter-order-chanel";
import OrderDateFilter from "./filter-order-date";

const OrderFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname(); // ví dụ "/admin/products"

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };
  return (
    <div className="space-y-4 grid grid-cols-3">
      <div className="col-span-1 space-y-4">
        <OrderStatusFilter />
        <OrderChanelFilter />
        <OrderDateFilter />
      </div>
      <div className="flex justify-end pt-3 col-span-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="bg-red-200 text-black border-red-400"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default OrderFilterForm;
