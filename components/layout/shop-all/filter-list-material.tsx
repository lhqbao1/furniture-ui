"use client";

import { useGetAllMaterials } from "@/features/products/hook";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import FilterSection from "./skeleton";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const INITIAL_VISIBLE = 5;

const FilterListMaterials = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const { data: listMaterials, isLoading, isError } = useGetAllMaterials();
  const selectedMaterials = searchParams.getAll("materials");

  const [expanded, setExpanded] = useState(false);

  const toggleMaterial = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("materials");

    params.delete("materials");

    if (current.includes(value)) {
      current
        .filter((c) => c !== value)
        .forEach((c) => params.append("materials", c));
    } else {
      current.forEach((c) => params.append("materials", c));
      params.append("materials", value);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading || !listMaterials) return <FilterSection />;
  if (isError) return <div>Error loading materials</div>;

  const shouldCollapse = listMaterials.length > INITIAL_VISIBLE;

  return (
    <div>
      {/* MATERIAL LIST */}
      <div
        className={`
          overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
          ${
            expanded
              ? "max-h-[1000px] opacity-100"
              : "max-h-[120px] opacity-100"
          }
        `}
      >
        <div className="flex flex-wrap gap-2">
          {listMaterials.map((item, index) => {
            if (!expanded && index >= INITIAL_VISIBLE) return null;

            const active = selectedMaterials.includes(item);

            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleMaterial(item)}
                className={`
                  px-3 py-1.5 rounded-full border text-sm transition
                  ${
                    active
                      ? "border-secondary bg-secondary text-white"
                      : "border-gray-300 bg-white text-black hover:border-black"
                  }
                `}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      {shouldCollapse && (
        <Button
          type="button"
          variant={"outline"}
          onClick={() => setExpanded((v) => !v)}
          className="mt-6 text-sm font-medium"
        >
          {expanded ? t("showLess") : t("showMore")}
        </Button>
      )}
    </div>
  );
};

export default FilterListMaterials;
