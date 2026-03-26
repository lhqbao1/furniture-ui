"use client";

import React from "react";
import { Filter, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import ShopAllFilterSection from "./shop-all-filter-section";
import { useSearchParams } from "next/navigation";

const MobileFilter = () => {
  const searchParams = useSearchParams();

  const activeFilterCount =
    searchParams.getAll("categories").length +
    searchParams.getAll("brand").length +
    searchParams.getAll("color").length +
    searchParams.getAll("materials").length +
    searchParams.getAll("delivery_time").length +
    (searchParams.get("price_min") ? 1 : 0) +
    (searchParams.get("price_max") ? 1 : 0);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-[#fff5e9] px-2 py-0.5 text-xs font-medium text-[#b86a0f]">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[100dvh] w-[95vw] max-w-none border-l p-0 data-[vaul-drawer-direction=right]:w-[95vw] data-[vaul-drawer-direction=right]:sm:max-w-none">
        <DrawerHeader className="sticky top-0 z-10 border-b bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle className="text-lg font-semibold text-[#1f2937]">
              Filter
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <ShopAllFilterSection isMobileDrawer />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileFilter;
