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
import { categoryClickedAtom } from "@/store/categories-drawer";

interface Props {
  categories: CategoryResponse[];
}

export default function CategoriesDrawer({ categories }: Props) {
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [currentCategoryId] = useAtom(currentCategoryIdAtom);
  const [categoryClicked, setCategoryClicked] = useAtom(categoryClickedAtom);

  useEffect(() => {
    // Nếu không phải user click → KHÔNG mở drawer
    if (!categoryClicked) return;

    if (currentCategoryId) {
      setOpen(true);
      setExpanded(currentCategoryId);
    }
  }, [currentCategoryId, categoryClicked]);

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

        <div className="space-y-2 mt-4">
          {categories.map((cate) => (
            <Collapsible
              key={cate.id}
              open={expanded === cate.id}
              onOpenChange={(state) => setExpanded(state ? cate.id : null)}
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

              <AnimatedCollapsibleContent open={expanded === cate.id}>
                <div className="pl-4 space-y-1 py-2">
                  {cate.children?.map((child) => (
                    <CategoryItem
                      key={child.id}
                      item={child}
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
