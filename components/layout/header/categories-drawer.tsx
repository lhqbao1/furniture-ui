"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { currentCategoryIdAtom } from "@/store/category";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryResponse } from "@/types/categories";
import CategoryItem from "./categories-item";
import { useTranslations } from "next-intl";
import AnimatedCollapsibleContent from "./categories-child";
import {
  categoryClickedAtom,
  expandAllCategoriesAtom,
} from "@/store/categories-drawer";

interface Props {
  categories: CategoryResponse[];
}

export default function CategoriesDrawer({ categories }: Props) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [currentCategoryId, setCurrentCategoryId] = useAtom(
    currentCategoryIdAtom,
  );
  const [categoryClicked, setCategoryClicked] = useAtom(categoryClickedAtom);
  const [expandAllSignal, setExpandAllSignal] = useAtom(
    expandAllCategoriesAtom,
  );

  const expandAll = useCallback(() => {
    setExpanded(new Set(categories.map((c) => c.id)));

    setCurrentCategoryId(null); // 🔥 FIX: Xóa ID → không override expand-all
    setOpen(true);
    setCategoryClicked(true);
  }, [categories, setCategoryClicked, setCurrentCategoryId]);

  useEffect(() => {
    if (expandAllSignal) {
      expandAll();
      setExpandAllSignal(false); // reset trigger
    }
  }, [expandAllSignal, expandAll, setExpandAllSignal]);

  useEffect(() => {
    // Nếu không phải user click → KHÔNG mở drawer
    if (!categoryClicked) return;

    if (currentCategoryId) {
      setOpen(true);
      setExpanded(new Set([currentCategoryId]));
    }
  }, [currentCategoryId, categoryClicked]);

  const closeDrawer = () => {
    setOpen(false);
    setCategoryClicked(false); // reset state
    setExpanded(new Set());
  };

  const isExpanded = useMemo(
    () => (id: string) => expanded.has(id),
    [expanded],
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(state) => {
        setOpen(state);
        if (!state) setCategoryClicked(false); // reset
      }}
      direction="left"
    >
      <DrawerContent className="px-4 py-2">
        <DrawerHeader>
          <DrawerTitle>{t("categories")}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {categories.map((cate) => (
            <Collapsible
              key={cate.id}
              open={isExpanded(cate.id)}
              onOpenChange={(state) => {
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (state) next.add(cate.id);
                  else next.delete(cate.id);
                  return next;
                });
              }}
            >
              <CollapsibleTrigger
                className="
                  w-fit text-left font-medium text-lg py-2 cursor-pointer relative
                  after:content-[''] after:absolute after:left-0 after:-bottom-1 
                  after:h-[2px] after:w-0 after:bg-secondary 
                  after:transition-all after:duration-500 
                  hover:after:w-full
                "
              >
                {cate.name}
              </CollapsibleTrigger>

              <AnimatedCollapsibleContent open={isExpanded(cate.id)}>
                <div className="pl-4 space-y-1 py-2">
                  {cate.children?.map((child) => (
                    <CategoryItem
                      key={child.id}
                      item={child}
                      onSelect={closeDrawer}
                    />
                  ))}
                </div>
              </AnimatedCollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
