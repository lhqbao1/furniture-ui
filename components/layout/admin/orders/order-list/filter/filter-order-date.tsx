"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
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

  // Sync params -> UI khi user back/forward
  useEffect(() => {
    setFromDate(searchParams.get("from_date") || undefined);
    setEndDate(searchParams.get("to_date") || undefined);
  }, [searchParams]);

  const updateUrlParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

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

    updateUrlParams(params);
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

    updateUrlParams(params);
  };

  const handleClearRange = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("from_date");
    params.delete("to_date");
    setFromDate(undefined);
    setEndDate(undefined);
    updateUrlParams(params);
  };

  return (
    <div className="space-y-3">
      {(fromDate || endDate) && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={handleClearRange}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex w-full flex-col gap-2 sm:w-1/2">
          <Label>From</Label>

          <div className="relative w-full">
            <SingleDatePicker
              label=""
              value={fromDate}
              onChange={(v) => handleFromDateChange(v ?? undefined)}
              className="w-full pr-10"
            />

            {fromDate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear from date"
                className="absolute right-1 top-1/2 z-10 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                onClick={() => handleFromDateChange(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-1/2">
          <Label>To</Label>

          <div className="relative w-full">
            <SingleDatePicker
              label=""
              value={endDate}
              onChange={(v) => handleToDateChange(v ?? undefined)}
              className="w-full pr-10"
            />

            {endDate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear to date"
                className="absolute right-1 top-1/2 z-10 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                onClick={() => handleToDateChange(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
