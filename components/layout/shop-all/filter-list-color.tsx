"use client";

import { useGetAllColor } from "@/features/products/hook";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import FilterSection from "./skeleton";
import { getColorStyle } from "@/hooks/color-map";
import ColorDot from "./color-dot";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

function normalizeColorKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/\band\b/g, "und") // and → und
    .split("und")
    .map((p) => p.trim())
    .filter(Boolean)
    .sort() // đảm bảo thứ tự
    .join(" und ");
}

const INITIAL_VISIBLE = 5;

const FilterListColors = () => {
  const [expanded, setExpanded] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const { data: listColors, isLoading, isError } = useGetAllColor(false);
  const selectedColors = searchParams.getAll("color");

  const toggleColor = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("color");

    params.delete("color");

    if (current.includes(value)) {
      current
        .filter((c) => c !== value)
        .forEach((c) => params.append("color", c));
    } else {
      current.forEach((c) => params.append("color", c));
      params.append("color", value);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const uniqueColors = useMemo(() => {
    if (!listColors) return [];

    const map = new Map<string, string>();

    listColors.forEach((color) => {
      const key = normalizeColorKey(color);

      if (!map.has(key)) {
        map.set(key, color); // giữ bản đầu tiên để hiển thị
      }
    });

    return Array.from(map.values());
  }, [listColors]);

  if (isLoading || !listColors) return <FilterSection />;
  if (isError) return <div>Error loading color</div>;

  const shouldCollapse = uniqueColors.length > INITIAL_VISIBLE;

  return (
    <div className="pl-2 pt-2">
      {/* LIST */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${
            expanded
              ? "max-h-[1000px] opacity-100"
              : "max-h-[180px] opacity-100"
          }
        `}
      >
        <div className="space-y-3">
          {uniqueColors.map((item, index) => {
            const checked = selectedColors.includes(item);
            const colorStyle = getColorStyle(item);

            // nếu chưa expand → chỉ render 5 item đầu (giữ height chuẩn)
            if (!expanded && index >= INITIAL_VISIBLE) return null;

            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleColor(item)}
                className="flex items-center gap-3 text-left cursor-pointer"
              >
                <ColorDot
                  color={colorStyle}
                  checked={checked}
                />
                <span className="text-sm font-light uppercase">{item}</span>
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

export default FilterListColors;
