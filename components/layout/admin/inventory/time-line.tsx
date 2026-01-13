"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const InventoryTimeLine = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<number | null>(null);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const start = dayjs(`2026-${i + 1}-01`);
        const end = start.endOf("month");
        return {
          label: start.format("MMM"),
          start,
          end,
        };
      }),
    [],
  );

  const handleSelectRange = (i: number) => {
    const isSame = selected === i;
    const params = new URLSearchParams(searchParams.toString());

    if (isSame) {
      setSelected(null);
      params.delete("from_date");
      params.delete("to_date");
      router.push(`?${params.toString()}`, { scroll: false });
      return;
    }

    const from = months[i].start.format("YYYY-MM-DD");
    const to = months[i].end.format("YYYY-MM-DD");

    setSelected(i);
    params.set("from_date", from);
    params.set("to_date", to);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-center gap-2 select-none">
      {months.map((m, i) => (
        <React.Fragment key={i}>
          {/* Dot + Label */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-3 w-3 rounded-full ",
                selected === i ? "bg-secondary" : "bg-gray-500",
              )}
            ></div>
            <span
              className={cn(
                "text-xs ",
                selected === i ? "text-secondary" : "text-muted-foreground",
              )}
            >
              {m.label}
            </span>
          </div>

          {/* Wide clickable region between dots */}
          {i < months.length - 1 && (
            <button
              onClick={() => handleSelectRange(i)}
              className={cn(
                "relative flex items-center justify-center",
                "w-16 h-6 cursor-pointer rounded-md",
                "transition-all",
                // selected === i
                //   ? "bg-secondary/40"
                //   : "hover:bg-gray-300/60 text-transparent",
              )}
            >
              {/* The line */}
              <div
                className={cn(
                  "h-[4px] w-full rounded-full transition-colors",
                  selected === i ? "bg-secondary" : "bg-gray-300",
                )}
              />
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default InventoryTimeLine;
