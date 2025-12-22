"use client";

import { useGetCategoriesWithChildren } from "@/features/category/hook";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import FilterSection from "./skeleton";

const FilterListCategories = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: parentCategories,
    isLoading,
    isError,
  } = useGetCategoriesWithChildren();

  const categories = useMemo(() => {
    if (!parentCategories) return [];
    return parentCategories.flatMap((parent) => parent.children ?? []);
  }, [parentCategories]);

  const selectedCategories = searchParams.getAll("categories");

  const toggleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("categories");

    params.delete("categories");

    if (current.includes(value)) {
      // ❌ đã có → remove
      current
        .filter((c) => c !== value)
        .forEach((c) => params.append("categories", c));
    } else {
      // ✅ chưa có → add
      current.forEach((c) => params.append("categories", c));
      params.append("categories", value);
    }

    // reset page khi filter đổi
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) return <FilterSection />;
  if (isError) return <div>Error loading categories</div>;

  return (
    <div className="space-y-3">
      {categories.map((item) => {
        const checked = selectedCategories.includes(item.name);

        return (
          <label
            key={item.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => toggleCategory(item.name)} // ✅ FIX
            />
            <span className="text-base font-light">{item.name}</span>
          </label>
        );
      })}
    </div>
  );
};

export default FilterListCategories;
