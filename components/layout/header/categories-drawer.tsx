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
import { ChevronDown } from "lucide-react";
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
      <DrawerContent className="p-0 data-[vaul-drawer-direction=left]:w-[min(92vw,390px)] data-[vaul-drawer-direction=left]:sm:max-w-[390px] border-r border-slate-200 bg-slate-50/80 shadow-2xl">
        <DrawerHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <DrawerTitle className="text-3xl font-semibold tracking-tight text-slate-900">
            {t("categories")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="h-[calc(100dvh-6.75rem)] overflow-y-auto no-scrollbar px-4 py-4">
          <div className="space-y-2.5">
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
                  group w-full rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-3 text-left shadow-sm transition-all duration-300
                  hover:border-slate-300 hover:shadow-md
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[17px] font-semibold leading-snug text-slate-900">
                    {cate.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
                      isExpanded(cate.id) ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <AnimatedCollapsibleContent open={isExpanded(cate.id)}>
                <div className="mx-1 mt-1 border-l border-slate-200 pl-3 pr-1 pb-1 pt-1.5">
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
        </div>
      </DrawerContent>
    </Drawer>
  );
}
