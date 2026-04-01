"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useGetCategoriesWithChildren } from "@/features/category/hook";
import { CategoryResponse } from "@/types/categories";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import FilterSection from "./skeleton";

interface FilterListCategoriesProps {
  isParentCategory?: boolean;
  categorySlug?: string;
}

type CategoryRenderMode = "hidden" | "flat" | "grouped";

type GroupedCategoryOptions = {
  header: CategoryResponse;
  items: CategoryResponse[];
};

const hasChildren = (category?: CategoryResponse | null): boolean =>
  Boolean(category?.children && category.children.length > 0);

const findCategoryBySlug = (
  categories: CategoryResponse[],
  slug: string,
): CategoryResponse | null => {
  for (const category of categories) {
    if (category.slug === slug) return category;
    if (hasChildren(category)) {
      const matched = findCategoryBySlug(category.children, slug);
      if (matched) return matched;
    }
  }
  return null;
};

const collectLeafCategories = (category: CategoryResponse): CategoryResponse[] => {
  if (!hasChildren(category)) return [category];
  return category.children.flatMap((child) => collectLeafCategories(child));
};

const dedupeCategoriesById = (categories: CategoryResponse[]): CategoryResponse[] => {
  const seen = new Set<string>();
  return categories.filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  });
};

const buildGroupedCategories = (
  directChildren: CategoryResponse[],
): GroupedCategoryOptions[] => {
  return directChildren
    .map((header) => ({
      header,
      items: dedupeCategoriesById(
        (header.children ?? []).flatMap((child) => collectLeafCategories(child)),
      ),
    }))
    .filter((group) => group.items.length > 0);
};

const FilterListCategories = ({
  isParentCategory = false,
  categorySlug,
}: FilterListCategoriesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: parentCategories,
    isLoading,
    isError,
  } = useGetCategoriesWithChildren();

  const categoryRenderData = useMemo<{
    mode: CategoryRenderMode;
    flatCategories: CategoryResponse[];
    groupedCategories: GroupedCategoryOptions[];
  }>(() => {
    if (!parentCategories) {
      return {
        mode: "flat",
        flatCategories: [],
        groupedCategories: [],
      };
    }

    if (!isParentCategory || !categorySlug) {
      return {
        mode: "flat",
        flatCategories: parentCategories.flatMap((parent) => parent.children ?? []),
        groupedCategories: [],
      };
    }

    const selectedCategory = findCategoryBySlug(parentCategories, categorySlug);
    if (!selectedCategory) {
      return {
        mode: "flat",
        flatCategories: parentCategories.flatMap((parent) => parent.children ?? []),
        groupedCategories: [],
      };
    }

    if (!hasChildren(selectedCategory)) {
      return {
        mode: "hidden",
        flatCategories: [],
        groupedCategories: [],
      };
    }

    const directChildren = selectedCategory.children;
    const hasNestedChildren = directChildren.some((child) => hasChildren(child));

    if (!hasNestedChildren) {
      return {
        mode: "flat",
        flatCategories: directChildren,
        groupedCategories: [],
      };
    }

    return {
      mode: "grouped",
      flatCategories: [],
      groupedCategories: buildGroupedCategories(directChildren),
    };
  }, [categorySlug, isParentCategory, parentCategories]);

  const selectedCategories = searchParams.getAll("categories");

  const toggleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("categories");

    params.delete("categories");

    if (current.includes(value)) {
      current
        .filter((categoryName) => categoryName !== value)
        .forEach((categoryName) => params.append("categories", categoryName));
    } else {
      current.forEach((categoryName) => params.append("categories", categoryName));
      params.append("categories", value);
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="pr-4">
        <FilterSection />
      </div>
    );
  }

  if (isError) return <div>Error loading categories</div>;
  if (categoryRenderData.mode === "hidden") return null;

  return (
    <div className="space-y-3">
      {categoryRenderData.mode === "grouped"
        ? categoryRenderData.groupedCategories.map((group) => (
            <div key={group.header.id} className="space-y-2">
              <p className="text-sm font-semibold text-[#111827]">
                {group.header.name}
              </p>
              <div className="space-y-2 pl-2">
                {group.items.map((item) => {
                  const checked = selectedCategories.includes(item.name);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleCategory(item.name)}
                      />
                      <span className="text-base font-light">{item.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        : categoryRenderData.flatCategories.map((item) => {
            const checked = selectedCategories.includes(item.name);
            return (
              <label
                key={item.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleCategory(item.name)}
                />
                <span className="text-base font-light">{item.name}</span>
              </label>
            );
          })}
    </div>
  );
};

export default FilterListCategories;
