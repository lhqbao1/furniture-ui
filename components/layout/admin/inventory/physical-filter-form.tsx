"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";

export default function PhysicalInventoryFilterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const econeloParam = searchParams.get("is_econelo");
  const value =
    econeloParam === "true" || econeloParam === "false"
      ? econeloParam
      : "all";

  const handleChange = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "all") {
      params.delete("is_econelo");
    } else {
      params.set("is_econelo", nextValue);
    }

    params.set("page", "1");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-3">
        <Label className="font-medium">Product Source</Label>
        <RadioGroup
          value={value}
          onValueChange={handleChange}
          className="flex flex-wrap items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="physical-source-all" />
            <Label htmlFor="physical-source-all" className="cursor-pointer">
              All
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="true" id="physical-source-econelo" />
            <Label htmlFor="physical-source-econelo" className="cursor-pointer">
              Econelo
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="false" id="physical-source-prestige-home" />
            <Label
              htmlFor="physical-source-prestige-home"
              className="cursor-pointer"
            >
              Prestige Home
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="bg-red-200 text-black border-red-400"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
