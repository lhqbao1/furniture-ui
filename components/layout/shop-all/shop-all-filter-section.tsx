import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import FilterListCategories from "./filter-list-categories";
import FilterListBrands from "./filter-list-brand";
import FilterListColors from "./filter-list-color";
import FilterListMaterials from "./filter-list-material";
import PriceRangeFilter from "./filter-price-range";
import FilterListDeliveryTime from "./filter-delivery-time";

interface ShopAllFilterSectionProps {
  isShopAll?: boolean;
  isParentCategory?: boolean;
}

const ShopAllFilterSection = ({
  isShopAll = true,
  isParentCategory = false,
}: ShopAllFilterSectionProps) => {
  const t = useTranslations();

  return (
    <aside>
      <Accordion
        type="multiple"
        className="w-full space-y-8 border-r border-black"
        defaultValue={["category"]} // ✅
      >
        {isShopAll || isParentCategory ? (
          <AccordionItem
            value="category"
            className="border-black"
          >
            <AccordionTrigger
              className="pr-4"
              iconClassName="size-7 text-black"
            >
              <span className="text-black font-bold text-xl">
                {t("categories")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <FilterListCategories isParentCategory={isParentCategory} />
            </AccordionContent>
          </AccordionItem>
        ) : (
          ""
        )}

        <AccordionItem
          value="brand"
          className="border-black"
        >
          <AccordionTrigger
            className="pr-4"
            iconClassName="size-7 text-black"
          >
            <span className="text-black font-bold text-xl">{t("brand")}</span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <FilterListBrands />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="color"
          className="border-black"
        >
          <AccordionTrigger
            className="pr-4"
            iconClassName="size-7 text-black"
          >
            <span className="text-black font-bold text-xl">{t("color")}</span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <FilterListColors />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="material"
          className="border-black"
        >
          <AccordionTrigger
            className="pr-4"
            iconClassName="size-7 text-black"
          >
            <span className="text-black font-bold text-xl">
              {t("materials")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <FilterListMaterials />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="price-range"
          className="border-black"
        >
          <AccordionTrigger
            className="pr-4"
            iconClassName="size-7 text-black"
          >
            <span className="text-black font-bold text-xl">{t("price")}</span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <PriceRangeFilter />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="delivery-time"
          className="border-black"
        >
          <AccordionTrigger
            className="pr-4"
            iconClassName="size-7 text-black"
          >
            <span className="text-black font-bold text-xl">
              {t("estimated_delivery")}
            </span>
          </AccordionTrigger>{" "}
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <FilterListDeliveryTime />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default ShopAllFilterSection;
