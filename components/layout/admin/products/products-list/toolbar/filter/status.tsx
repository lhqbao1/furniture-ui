"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePathname } from "@/src/i18n/navigation";
import { useEffect } from "react";

export default function ProductStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const showAllParam = searchParams.get("all_products");

  const value = showAllParam === null ? "all" : showAllParam;

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
    <div className="flex flex-col gap-3">
      <Label className="font-medium">Product Status</Label>

      <RadioGroup
        value={value}
        onValueChange={handleChange}
        className="flex items-center gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="true"
            id="active"
          />
          <Label
            htmlFor="active"
            className="cursor-pointer"
          >
            Active Only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="false"
            id="inactive"
          />
          <Label
            htmlFor="active"
            className="cursor-pointer"
          >
            Inactive
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="all"
            id="all"
          />
          <Label
            htmlFor="all"
            className="cursor-pointer"
          >
            Show All
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
