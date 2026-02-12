import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import React from "react";
import ProductStatusFilter from "../products/products-list/toolbar/filter/status";
import ProductHasInventoryFilter from "./filter/hasInventoryFilter";
import SupplierFilter from "../products/products-list/toolbar/filter/supplier-filter";
import BrandFilter from "../products/products-list/toolbar/filter/brand/brand-filter";

const InventoryFilterForm = () => {
  const router = useRouter();
  const pathname = usePathname(); // ví dụ "/admin/products"

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };
  return (
    <div className="space-y-4 grid grid-cols-3">
      <div className="col-span-3 space-y-4">
        <ProductStatusFilter />
        {/* <ProductHasInventoryFilter /> */}
        <SupplierFilter />
        <BrandFilter />
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

export default InventoryFilterForm;
