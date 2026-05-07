"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import React from "react";
import ProductStatusFilter from "../products/products-list/toolbar/filter/status";
import BrandFilter from "../products/products-list/toolbar/filter/brand/brand-filter";
import InventoryFilterExportButton from "./filter-export-button";

const PH_INVENTORY_SUPPLIER_ID = "prestige_home";

export default function PHInventoryFilterForm() {
  const router = useRouter();
  const pathname = usePathname();

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-3 space-y-4">
      <div className="col-span-3 space-y-4">
        <ProductStatusFilter />
        <BrandFilter />
      </div>
      <div className="col-span-3 flex justify-end gap-2 pt-3">
        <InventoryFilterExportButton
          forcedSupplierId={PH_INVENTORY_SUPPLIER_ID}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-red-400 bg-red-200 text-black"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
