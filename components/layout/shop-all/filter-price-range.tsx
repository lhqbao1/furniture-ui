"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/use-debounce";

const MIN = 0;
const MAX = 5000;

function Bubble({ value, percent }: { value: number; percent: number }) {
  return (
    <div
      className="absolute -top-1"
      style={{
        left: `${percent}%`,
        transform: "translateX(-50%)",
      }}
    >
      <span className="inline-block rounded bg-secondary px-2 py-0.5 text-base text-white whitespace-nowrap">
        {value.toLocaleString("de-DE")} €
      </span>
    </div>
  );
}

export default function PriceRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const minFromUrl = Number(searchParams.get("price_min")) || MIN;
  const maxFromUrl = Number(searchParams.get("price_max")) || MAX;

  const [value, setValue] = React.useState<[number, number]>([
    minFromUrl,
    maxFromUrl,
  ]);

  // sync khi back/forward
  React.useEffect(() => {
    setValue([minFromUrl, maxFromUrl]);
  }, [minFromUrl, maxFromUrl]);

  const updateUrl = React.useCallback(
    (next: [number, number]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next[0] === MIN) params.delete("price_min");
      else params.set("price_min", String(next[0]));

      if (next[1] === MAX) params.delete("price_max");
      else params.set("price_max", String(next[1]));

      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // 🔥 debounce URL update
  const debouncedUpdateUrl = useDebouncedCallback(updateUrl, 400);

  const handleChange = (v: number[]) => {
    const next = v as [number, number];
    setValue(next);
    debouncedUpdateUrl(next); // 👈 không spam router
  };

  return (
    <div className="space-y-4 mt-6 px-12">
      {/* BUBBLES */}
      <div className="relative h-7">
        <Bubble
          value={value[0]}
          percent={(value[0] / MAX) * 100}
        />
        <Bubble
          value={value[1]}
          percent={(value[1] / MAX) * 100}
        />
      </div>

      {/* SLIDER */}
      <Slider
        min={MIN}
        max={MAX}
        step={1}
        value={value}
        onValueChange={handleChange}
      />

      {/* LABELS */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value[0].toLocaleString("de-DE")} €</span>
        <span>{value[1].toLocaleString("de-DE")} €</span>
      </div>
    </div>
  );
}
