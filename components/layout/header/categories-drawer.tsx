"use client";

import {
  Drawer,
  DrawerClose,
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
import { ChevronDown, X } from "lucide-react";
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
      direction="right"
    >
      <DrawerContent className="z-[1200] p-0 data-[vaul-drawer-direction=right]:w-[min(94vw,420px)] data-[vaul-drawer-direction=right]:sm:max-w-[420px] border-l border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
        <DrawerHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {t("categories")}
              </DrawerTitle>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Schnellnavigation
              </p>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close categories drawer"
                className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="h-[calc(100dvh-6.25rem)] overflow-y-auto no-scrollbar px-4 py-4">
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
                  group relative w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-300
                  hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_28px_-22px_rgba(15,23,42,0.75)]
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
