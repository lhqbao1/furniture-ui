import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import ExportOrderExcelButton from "../export-button";
import OrderStatusFilter from "./filter-order-status";
import OrderChanelFilter from "./filter-order-chanel";
import OrderDateFilter from "./filter-order-date";
import OrderClaimedFilter from "./filter-order-claimed";
import OrderCountryFilter from "./filter-order-country";

interface OrderFilterFormProps {
  showClaimedFilters?: boolean;
  showCountryFilter?: boolean;
  showExportButton?: boolean;
  exportPresetStatuses?: string[];
  lockExportStatuses?: boolean;
  expandExportByRefundItems?: boolean;
  onResetFilters?: () => void;
}

const OrderFilterForm = ({
  showClaimedFilters = false,
  showCountryFilter = false,
  showExportButton = false,
  exportPresetStatuses,
  lockExportStatuses = false,
  expandExportByRefundItems = false,
  onResetFilters,
}: OrderFilterFormProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
      toast.success("Đã xoá các filter");
      return;
    }

    router.push(pathname, { scroll: false });
    toast.success("Đã xoá các filter");
  };

  const hasActiveFilters =
    searchParams.get("status") ||
    searchParams.get("channel") ||
    searchParams.get("from_date") ||
    searchParams.get("to_date") ||
    searchParams.get("country") ||
    searchParams.get("is_b2b") ||
    searchParams.get("is_claimed_factory") ||
    searchParams.get("is_claimed_marketplace") ||
    searchParams.get("search") ||
    searchParams.get("multi_search");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <OrderStatusFilter />
        <OrderChanelFilter />
        {showCountryFilter ? <OrderCountryFilter /> : null}
        {showClaimedFilters ? <OrderClaimedFilter /> : null}
      </div>

      <div className="space-y-4">
        <OrderDateFilter />
      </div>

      <div className="col-span-1 flex items-center justify-end gap-2 pt-4 md:col-span-2">
        {showExportButton ? (
          <ExportOrderExcelButton
            presetStatuses={exportPresetStatuses}
            lockStatusSelection={lockExportStatuses}
            expandByProductRefund={expandExportByRefundItems}
          />
        ) : null}

        <Button
          variant="outline"
          onClick={handleReset}
          className="h-10 min-w-[108px] border-secondary/20 bg-muted/40 text-foreground hover:bg-muted"
          disabled={!hasActiveFilters}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default OrderFilterForm;
