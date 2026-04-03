import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import React from "react";
import OrderStatusFilter from "./filter-order-status";
import OrderChanelFilter from "./filter-order-chanel";
import OrderDateFilter from "./filter-order-date";
import OrderB2BFilter from "./filter-order-b2b";
import { useSearchParams } from "next/navigation";

const OrderFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname(); // ví dụ "/admin/products"
  const searchParams = useSearchParams();
  const isOrderListPage = pathname.includes("/orders/list");

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    searchParams.get("status") ||
    searchParams.get("channel") ||
    searchParams.get("from_date") ||
    searchParams.get("to_date") ||
    searchParams.get("is_b2b");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-4">
        {isOrderListPage ? <OrderB2BFilter /> : null}
        <OrderStatusFilter />
        <OrderChanelFilter />
      </div>
      <div className="space-y-4">
        <OrderDateFilter />
      </div>
      <div className="col-span-1 flex justify-end pt-2 md:col-span-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
          disabled={!hasActiveFilters}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default OrderFilterForm;
