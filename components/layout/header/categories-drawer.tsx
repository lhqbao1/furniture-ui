"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { currentCategoryIdAtom } from "@/store/category";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
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
  const [expanded, setExpanded] = useState<string[]>([]);

  const [currentCategoryId, setCurrentCategoryId] = useAtom(
    currentCategoryIdAtom,
  );
  const [categoryClicked, setCategoryClicked] = useAtom(categoryClickedAtom);
  const [expandAllSignal, setExpandAllSignal] = useAtom(
    expandAllCategoriesAtom,
  );

  const expandAll = () => {
    const allIds = categories.map((c) => c.id);
    setExpanded(allIds);

    setCurrentCategoryId(null); // 🔥 FIX: Xóa ID → không override expand-all
    setOpen(true);
    setCategoryClicked(true);
  };

  useEffect(() => {
    if (expandAllSignal) {
      expandAll();
      setExpandAllSignal(false); // reset trigger
    }
  }, [expandAllSignal]);

  useEffect(() => {
    // Nếu không phải user click → KHÔNG mở drawer
    if (!categoryClicked) return;

    if (currentCategoryId) {
      setOpen(true);
      setExpanded([currentCategoryId]);
    }
  }, [currentCategoryId, categoryClicked]);

  const closeDrawer = () => {
    setOpen(false);
    setCategoryClicked(false); // reset state
    setExpanded([]);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(state) => {
        setOpen(state);
        if (!state) setCategoryClicked(false); // reset
      }}
      direction="left"
    >
      <DrawerContent className="px-4 py-2 overflow-auto">
        <DrawerHeader>
          <DrawerTitle>{t("categories")}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-2 mt-4">
          {categories.map((cate) => (
            <Collapsible
              key={cate.id}
              open={expanded.includes(cate.id)}
              onOpenChange={(state) => {
                if (state) {
                  setExpanded((prev) => [...prev, cate.id]);
                } else {
                  setExpanded((prev) => prev.filter((id) => id !== cate.id));
                }
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

              <AnimatedCollapsibleContent open={expanded.includes(cate.id)}>
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
