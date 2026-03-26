"use client";
import { useGetCategories } from "@/features/category/hook";
import React, { useState } from "react";
import AddCategoryDrawer from "./add-category-modal";
import {
  ChevronRight,
  CornerDownRight,
  Loader2,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { CategoryResponse } from "@/types/categories";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useAtom } from "jotai";
import {
  selectedCategoryAtom,
  selectedCategoryNameAtom,
} from "@/store/category";
import DeleteDialog from "./delete-dialog";
import { Button } from "@/components/ui/button";
import ExportCategory from "./export-category";
import { cn } from "@/lib/utils";

interface CategoryItemProps {
  category: CategoryResponse;
  level?: number;
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  level = 0,
  expandedIds,
  setExpandedIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom);
  const [, setSelectedCategoryName] = useAtom(selectedCategoryNameAtom);

  const hasChildren = category.children && category.children.length > 0;
  const isSelectable = !hasChildren;

  const handleClick = () => {
    if (isSelectable) {
      setSelectedCategory(category.id);
      setSelectedCategoryName(category.name);
    }
  };

  const isOpen = expandedIds.includes(category.id);
  const toggleOpen = (open: boolean) => {
    setExpandedIds((prev) =>
      open ? [...prev, category.id] : prev.filter((id) => id !== category.id),
    );
  };

  const activeClass =
    isSelectable && selectedCategory === category.id;

  const indentStyle = { paddingLeft: `${level * 14}px` };
  const label = category.code ? `${category.name} (${category.code})` : category.name;

  return (
    <div className="flex flex-col">
      {hasChildren ? (
        <Collapsible
          open={isOpen}
          onOpenChange={toggleOpen}
        >
          <CollapsibleTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f1f7f1]"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              <div
                className="flex min-w-0 items-center gap-1"
                style={indentStyle}
              >
                <ChevronRight
                  stroke="#00B159"
                  className={cn(
                    "shrink-0 transition-transform duration-300",
                    isOpen ? "rotate-90" : "",
                  )}
                  size={18}
                />
                {level > 0 ? (
                  <ChevronRight
                    stroke="#00B159"
                    className="ml-0.5 shrink-0"
                    size={18}
                  />
                ) : null}
                <span className="truncate text-sm font-medium text-[#1f2937]">
                  {label}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <DeleteDialog categoryId={category.id} />
                <AddCategoryDrawer
                  categoryValues={{
                    name: category.name,
                    level: category.level,
                    img_url: category.img_url,
                    meta_description: category.meta_description,
                    meta_keywords: category.meta_keywords,
                    meta_title: category.meta_title,
                    parent_id: category.parent_id ?? "",
                    is_econelo: category.is_econelo,
                    code: category.code,
                  }}
                  categoryId={category.id}
                />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-1">
            <div className="mt-1 flex flex-col gap-0.5">
              {category.children!.map((child) => (
                <CategoryItem
                  key={child.id}
                  category={child}
                  level={level + 1}
                  expandedIds={expandedIds}
                  setExpandedIds={setExpandedIds}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f1f7f1]",
            activeClass ? "bg-[#eaf8ef] text-primary" : "text-[#1f2937]",
          )}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          <div
            className="flex min-w-0 items-center gap-1"
            style={indentStyle}
          >
            {level === 0 ? (
              <ChevronRight
                stroke="#00B159"
                size={18}
              />
            ) : (
              <CornerDownRight
                stroke="#00B159"
                size={18}
              />
            )}
            <span className="truncate text-sm font-medium">
              {label}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <DeleteDialog categoryId={category.id} />
            <AddCategoryDrawer
              categoryValues={{
                name: category.name,
                level: category.level,
                img_url: category.img_url,
                meta_description: category.meta_description,
                meta_keywords: category.meta_keywords,
                meta_title: category.meta_title,
                code: category.code,
                parent_id: category.parent_id ?? "",
                is_econelo: category.is_econelo,
              }}
              categoryId={category.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ListCategories = () => {
  const { data: categories, isLoading } = useGetCategories();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const getAllCategoryIdsWithChildren = (
    items: CategoryResponse[],
  ): string[] => {
    let ids: string[] = [];
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        ids.push(item.id);
        ids = [...ids, ...getAllCategoryIdsWithChildren(item.children)];
      }
    });
    return ids;
  };

  const handleExpandAll = () => {
    if (!categories) return;
    setExpandedIds(getAllCategoryIdsWithChildren(categories));
  };

  const handleCollapseAll = () => {
    setExpandedIds([]);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AddCategoryDrawer />
        {categories ? (
          <ExportCategory
            categories={categories}
            isFetching={isLoading}
          />
        ) : null}
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            disabled={!categories?.length}
          >
            <ChevronsUpDown className="mr-1 h-4 w-4" />
            Expand
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            disabled={!expandedIds.length}
          >
            <ChevronsDownUp className="mr-1 h-4 w-4" />
            Collapse
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-gray-100 bg-[#fbfdfb] p-2">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#00B159]" />
          </div>
        ) : (
          <div className="max-h-[65vh] space-y-1 overflow-y-auto pr-1">
            {categories?.length ? (
              categories.map((item) => (
                <CategoryItem
                  key={item.id}
                  category={item}
                  expandedIds={expandedIds}
                  setExpandedIds={setExpandedIds}
                />
              ))
            ) : (
              <div className="px-2 py-6 text-sm text-muted-foreground">
                No category found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListCategories;
