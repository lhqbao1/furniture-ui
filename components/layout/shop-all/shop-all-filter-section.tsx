import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import FilterListCategories from "./filter-list-categories";
import FilterListBrands from "./filter-list-brand";
import FilterListColors from "./filter-list-color";
import FilterListMaterials from "./filter-list-material";
import PriceRangeFilter from "./filter-price-range";
import FilterListDeliveryTime from "./filter-delivery-time";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ShopAllFilterSectionProps {
  isShopAll?: boolean;
  isParentCategory?: boolean;
  isMobileDrawer?: boolean;
}

const ShopAllFilterSection = ({
  isShopAll = true,
  isParentCategory = false,
  isMobileDrawer = false,
}: ShopAllFilterSectionProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilterCount =
    searchParams.getAll("categories").length +
    searchParams.getAll("brand").length +
    searchParams.getAll("color").length +
    searchParams.getAll("materials").length +
    searchParams.getAll("delivery_time").length +
    (searchParams.get("price_min") ? 1 : 0) +
    (searchParams.get("price_max") ? 1 : 0);

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categories");
    params.delete("brand");
    params.delete("color");
    params.delete("materials");
    params.delete("delivery_time");
    params.delete("price_min");
    params.delete("price_max");
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <aside
      className={cn(
        "w-full rounded-2xl border border-[#e6eaf0] bg-white p-4 shadow-sm",
        isMobileDrawer && "border-none bg-transparent p-0 shadow-none",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eef6ff]">
              <SlidersHorizontal className="h-4 w-4 text-[#3366aa]" />
            </span>
            <p className="text-base font-semibold text-[#111827]">Filter</p>
          </div>

          {activeFilterCount > 0 ? (
            <span className="mt-1.5 inline-flex rounded-full border border-[#f5d7b5] bg-[#fffaf3] px-2.5 py-1 text-xs font-medium text-[#b86a0f]">
              {activeFilterCount} aktive Filter
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            disabled={activeFilterCount === 0}
            className="h-8 rounded-full px-3 text-xs"
          >
            {t("resetFilters")}
          </Button>
        </div>
      </div>

      <Accordion
        type="multiple"
        className="w-full space-y-3"
        defaultValue={["category"]} // ✅
      >
        {isShopAll || isParentCategory ? (
          <AccordionItem
            value="category"
            className="rounded-xl border border-[#e6eaf0] bg-white px-4"
          >
            <AccordionTrigger
              className="pr-1 py-3"
              iconClassName="size-5 text-[#4b5563]"
              hasIcon
            >
              <span className="text-[#111827] font-semibold text-base">
                {t("categories")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance pt-1">
              <FilterListCategories isParentCategory={isParentCategory} />
            </AccordionContent>
          </AccordionItem>
        ) : null}

        <AccordionItem
          value="brand"
          className="rounded-xl border border-[#e6eaf0] bg-white px-4"
        >
          <AccordionTrigger
            className="pr-1 py-3"
            iconClassName="size-5 text-[#4b5563]"
            hasIcon
          >
            <span className="text-[#111827] font-semibold text-base">
              {t("brand")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance pt-1">
            <FilterListBrands />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="color"
          className="rounded-xl border border-[#e6eaf0] bg-white px-4"
        >
          <AccordionTrigger
            className="pr-1 py-3"
            iconClassName="size-5 text-[#4b5563]"
            hasIcon
          >
            <span className="text-[#111827] font-semibold text-base">
              {t("color")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance pt-1">
            <FilterListColors />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="material"
          className="rounded-xl border border-[#e6eaf0] bg-white px-4"
        >
          <AccordionTrigger
            className="pr-1 py-3"
            iconClassName="size-5 text-[#4b5563]"
            hasIcon
          >
            <span className="text-[#111827] font-semibold text-base">
              {t("materials")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance pt-1">
            <FilterListMaterials />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="price-range"
          className="rounded-xl border border-[#e6eaf0] bg-white px-4"
        >
          <AccordionTrigger
            className="pr-1 py-3"
            iconClassName="size-5 text-[#4b5563]"
            hasIcon
          >
            <span className="text-[#111827] font-semibold text-base">
              {t("price")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance pt-1">
            <PriceRangeFilter />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="delivery-time"
          className="rounded-xl border border-[#e6eaf0] bg-white px-4"
        >
          <AccordionTrigger
            className="pr-1 py-3"
            iconClassName="size-5 text-[#4b5563]"
            hasIcon
          >
            <span className="text-[#111827] font-semibold text-base">
              {t("estimated_delivery")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance pt-1">
            <FilterListDeliveryTime />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default ShopAllFilterSection;
