"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePathname } from "@/src/i18n/navigation";
import { useEffect, useRef } from "react";

interface ProductStatusFilterProps {
  defaultActiveOnly?: boolean;
}

export default function ProductStatusFilter({
  defaultActiveOnly = false,
}: ProductStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasInitializedDefault = useRef(false);

  const showAllParam = searchParams.get("all_products");

  const value =
    showAllParam === null
      ? defaultActiveOnly
        ? "true"
        : "all"
      : showAllParam;

  useEffect(() => {
    if (
      !defaultActiveOnly ||
      showAllParam !== null ||
      hasInitializedDefault.current
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("all_products", "true");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    hasInitializedDefault.current = true;
  }, [defaultActiveOnly, pathname, router, searchParams, showAllParam]);

  const handleChange = (v: string) => {
    const params = new URLSearchParams(searchParams);

    if (v === "all") {
      params.delete("all_products");
    } else {
      params.set("all_products", v);
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <Label className="text-sm font-semibold text-slate-700">
        Product Status
      </Label>

      <RadioGroup
        value={value}
        onValueChange={handleChange}
        className="flex flex-wrap items-center gap-1"
      >
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/5">
          <RadioGroupItem value="true" id="active" />
          <Label htmlFor="active" className="cursor-pointer text-sm">
            Active Only
          </Label>
        </div>

        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/5">
          <RadioGroupItem value="false" id="inactive" />
          <Label htmlFor="inactive" className="cursor-pointer text-sm">
            Inactive
          </Label>
        </div>

        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/5">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all" className="cursor-pointer text-sm">
            Show All
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
