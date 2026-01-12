"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { SingleDatePicker } from "@/components/shared/single-date-picker";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

export default function OrderDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------------------------
  // Load values from URL
  // ---------------------------
  const [fromDate, setFromDate] = useState<string | undefined>(
    searchParams.get("from_date") || undefined,
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    searchParams.get("to_date") || undefined,
  );

  const param = searchParams.get("status") || "";
  const initialSelected = param ? param.split(",") : [];

  const [selected, setSelected] = useState<string[]>(initialSelected);

  // Sync params -> UI khi user back/forward
  useEffect(() => {
    setSelected(searchParams.get("status")?.split(",") || []);
    setFromDate(searchParams.get("from_date") || undefined);
    setEndDate(searchParams.get("to_date") || undefined);
  }, [searchParams]);

  // ---------------------------
  // Update FROM_DATE param
  // ---------------------------
  const handleFromDateChange = (v: string | undefined) => {
    const params = new URLSearchParams(searchParams);

    if (!v) {
      setFromDate(undefined);
      params.delete("from_date");
    } else {
      const d = new Date(v);
      d.setHours(0, 0, 0, 0);

      const formatted = formatDate(d);
      setFromDate(formatted);

      params.set("from_date", formatted);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ---------------------------
  // Update TO_DATE param
  // ---------------------------
  const handleToDateChange = (v: string | undefined) => {
    const params = new URLSearchParams(searchParams);

    if (!v) {
      setEndDate(undefined);
      params.delete("to_date");
    } else {
      const d = new Date(v);
      d.setHours(23, 59, 59, 0);

      const formatted = formatDate(d);
      setEndDate(formatted);

      params.set("to_date", formatted);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2 items-start w-fit">
        <Label>From:</Label>

        <div className="flex items-center gap-2 w-full">
          <SingleDatePicker
            label=""
            value={fromDate}
            onChange={(v) => handleFromDateChange(v ?? undefined)}
            className="w-[200px]"
          />

          {fromDate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleFromDateChange(undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start w-fit">
        <Label>To:</Label>

        <div className="flex items-center gap-2 w-full">
          <SingleDatePicker
            label=""
            value={endDate}
            onChange={(v) => handleToDateChange(v ?? undefined)}
            className="w-[200px]"
          />

          {endDate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleToDateChange(undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
