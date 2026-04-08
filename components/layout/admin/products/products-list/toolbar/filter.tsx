"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ProductStatusFilter from "./filter/status";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import SupplierFilter from "./filter/supplier-filter";
import BrandFilter from "./filter/brand/brand-filter";
import FilterExportForm from "./filter-export-dialog";

interface FilterFormProps {
  isDSP?: boolean;
}

export default function FilterForm({ isDSP = false }: FilterFormProps) {
  const router = useRouter();
  const pathname = usePathname(); // ví dụ "/admin/products"

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* All / Active toggles */}

      <ProductStatusFilter />

      {!isDSP && <SupplierFilter />}

      <BrandFilter />

      {/* Reset */}
      <div className="flex justify-end gap-2">
        <FilterExportForm />
        <Button variant="outline" className="bg-gray-200" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
