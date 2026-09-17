"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import SupplierFilter from "./filter/supplier-filter";
import BrandFilter from "./filter/brand/brand-filter";
import CategoryFilter from "./filter/category/category-filter";
import FilterExportForm from "./filter-export-dialog";

interface FilterFormProps {
  isDSP?: boolean;
}

export default function FilterForm({ isDSP = false }: FilterFormProps) {
  const router = useRouter();
  const pathname = usePathname(); // ví dụ "/admin/products"

  const handleReset = () => {
    router.push(`${pathname}?all_products=true`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {!isDSP && <SupplierFilter />}

      <BrandFilter />

      <CategoryFilter />

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
