"use client";

import { useGetCategoriesWithChildren } from "@/features/category/hook";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useGetBrands } from "@/features/brand/hook";
import FilterSection from "./skeleton";

const FilterListBrands = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: listBrands, isLoading, isError } = useGetBrands();

  const selectedBrands = searchParams.getAll("brand");

  const toggleBrand = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("brand");

    params.delete("brand");

    if (current.includes(value)) {
      // ❌ đã có → remove
      current
        .filter((c) => c !== value)
        .forEach((c) => params.append("brand", c));
    } else {
      // ✅ chưa có → add
      current.forEach((c) => params.append("brand", c));
      params.append("brand", value);
    }

    // reset page khi filter đổi
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading || !listBrands) return <FilterSection />;
  if (isError) return <div>Error loading brand</div>;

  return (
    <div className="space-y-3">
      {listBrands.map((item) => {
        const checked = selectedBrands.includes(item.name);

        return (
          <label
            key={item.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => toggleBrand(item.name)} // ✅ FIX
            />
            <span className="text-base font-light uppercase">{item.name}</span>
          </label>
        );
      })}
    </div>
  );
};

export default FilterListBrands;
