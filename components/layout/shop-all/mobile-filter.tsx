"use client";

import React from "react";
import { Filter } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ShopAllFilterSection from "./shop-all-filter-section";
import { useTranslations } from "next-intl";

const MobileFilter = () => {
  const t = useTranslations();
  return (
    <Dialog>
      {/* Trigger button */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="sm:max-w-[420px] h-[90%] overflow-auto">
        {/* <DialogHeader className="h-fit">
        </DialogHeader> */}
        <DialogTitle className="text-center text-2xl text-secondary font-semibold">
          Filter
        </DialogTitle>

        <ShopAllFilterSection />
      </DialogContent>
    </Dialog>
  );
};

export default MobileFilter;
