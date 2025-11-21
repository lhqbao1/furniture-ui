"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ProductStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const showAllParam = searchParams.get("all_products");

  // ⭐ default = true → nếu không có param thì mặc định là ALL
  const showAll = showAllParam === "true" || showAllParam === null;

  const value = showAll ? "all" : "active";

  const handleChange = (v: string) => {
    const params = new URLSearchParams(searchParams);

    if (v === "active") {
      params.set("all_products", "false");
    } else {
      params.set("all_products", "true");
    }

    router.push(`?${params.toString()}`, { scroll: false });
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
            value="active"
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
