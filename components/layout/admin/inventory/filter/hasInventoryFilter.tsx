"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePathname } from "@/src/i18n/navigation";
import { useEffect } from "react";

export default function ProductHasInventoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const showAllParam = searchParams.get("is_inventory");

  // ⭐ default = true → nếu không có param thì mặc định là ALL
  const showAll = showAllParam === "true" || showAllParam === null;

  const value = showAll ? "true" : "false";

  const handleChange = (v: string) => {
    const params = new URLSearchParams(searchParams);

    params.set("is_inventory", v);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const raw = searchParams.get("is_inventory");

    // nếu chưa có param → set default
    if (raw === null) {
      const params = new URLSearchParams(searchParams);
      params.set("is_inventory", "true");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

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
            Has Inventory
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="false"
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
