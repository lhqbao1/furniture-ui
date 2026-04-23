"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ClaimedFilterState = {
  isClaimedFactory: boolean;
  isClaimedMarketplace: boolean;
};

const parseBooleanParam = (param: string | null) => {
  if (!param) return false;
  return param.trim().toLowerCase() === "true";
};

export default function OrderClaimedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<ClaimedFilterState>({
    isClaimedFactory: parseBooleanParam(searchParams.get("is_claimed_factory")),
    isClaimedMarketplace: parseBooleanParam(
      searchParams.get("is_claimed_marketplace"),
    ),
  });

  useEffect(() => {
    setSelected({
      isClaimedFactory: parseBooleanParam(
        searchParams.get("is_claimed_factory"),
      ),
      isClaimedMarketplace: parseBooleanParam(
        searchParams.get("is_claimed_marketplace"),
      ),
    });
  }, [searchParams]);

  const updateClaimedParam = (
    key: keyof ClaimedFilterState,
    queryKey: "is_claimed_factory" | "is_claimed_marketplace",
    checked: boolean,
  ) => {
    const params = new URLSearchParams(searchParams);

    setSelected((prev) => ({
      ...prev,
      [key]: checked,
    }));

    if (checked) {
      params.set(queryKey, "true");
    } else {
      params.delete(queryKey);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Claimed</Label>
      <div className="space-y-2 rounded-lg border p-3">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={selected.isClaimedFactory}
            onCheckedChange={(checked) =>
              updateClaimedParam(
                "isClaimedFactory",
                "is_claimed_factory",
                checked === true,
              )
            }
          />
          <span className="text-sm">Factory claimed</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={selected.isClaimedMarketplace}
            onCheckedChange={(checked) =>
              updateClaimedParam(
                "isClaimedMarketplace",
                "is_claimed_marketplace",
                checked === true,
              )
            }
          />
          <span className="text-sm">Marketplace claimed</span>
        </label>
      </div>
    </div>
  );
}
