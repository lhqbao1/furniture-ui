"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useGetCategories } from "@/features/category/hook";
import CategorySelect from "./category-select";
import { flattenCategoryOptions } from "./category-options";

const CategoryFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categoryId, setCategoryId] = useState(
    searchParams.get("category_id") ?? "",
  );

  const { data: categories } = useGetCategories();
  const categoryOptions = useMemo(
    () => flattenCategoryOptions(categories ?? []),
    [categories],
  );

  const handleChange = (value: string) => {
    setCategoryId(value);

    const params = new URLSearchParams(searchParams.toString());

    if (!value) params.delete("category_id");
    else params.set("category_id", value);

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-2">
      <Label>Select Category</Label>
      {categories ? (
        <CategorySelect
          categories={categoryOptions}
          categoryId={categoryId}
          setCategoryId={handleChange}
        />
      ) : (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  );
};

export default CategoryFilter;
