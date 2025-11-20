import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import React from "react";
import OrderStatusFilter from "./filter-order-status";

const OrderFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname(); // ví dụ "/admin/products"

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };
  return (
    <div className="space-y-4">
      <OrderStatusFilter />
      <div className="flex justify-end pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default OrderFilterForm;
