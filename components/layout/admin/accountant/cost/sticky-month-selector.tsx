"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function getMonthRange(date: Date) {
  return {
    from: new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
  };
}

export default function MonthRangeCalendarPopover() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const [activeMonth, setActiveMonth] = useState<Date | null>(null);

  useEffect(() => {
    const fromParam = searchParams.get("from_date");
    if (fromParam) {
      setActiveMonth(new Date(fromParam));
    } else {
      setActiveMonth(null);
    }
  }, [searchParams]);

  const range = activeMonth ? getMonthRange(activeMonth) : undefined;

  const handleMonthChange = (month: Date) => {
    setActiveMonth(month);

    const { from, to } = getMonthRange(month);
    const params = new URLSearchParams(searchParams);

    params.set("from_date", formatDate(from));
    params.set("to_date", formatDate(to));

    router.push(`?${params.toString()}`, { scroll: false });

    // 👉 chọn xong thì đóng popover
    setOpen(false);
  };

  const handleClear = () => {
    setActiveMonth(null);

    const params = new URLSearchParams(searchParams);
    params.delete("from_date");
    params.delete("to_date");

    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  };

  return (
    <div className="flex flex-col gap-1 mt-3 sticky top-6">
      <Label className="text-sm font-semibold">Select Month</Label>

      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] justify-between font-normal pr-2"
          >
            <span>
              {activeMonth ? format(activeMonth, "MMMM yyyy") : "Select month"}
            </span>

            <span className="flex items-center gap-1">
              {activeMonth && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // ❗ không mở popover
                    handleClear();
                  }}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5 opacity-70" />
                </button>
              )}

              <CalendarIcon className="h-4 w-4 opacity-70" />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="range"
            month={activeMonth ?? undefined}
            selected={range}
            onMonthChange={handleMonthChange}
            showOutsideDays={false}
            captionLayout="dropdown"
            disabled={() => true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
