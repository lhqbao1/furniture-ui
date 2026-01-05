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
import { CalendarIcon } from "lucide-react";
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

  const [activeMonth, setActiveMonth] = useState<Date>(() => {
    const fromParam = searchParams.get("from_date");
    return fromParam ? new Date(fromParam) : new Date();
  });

  // 🔄 Sync URL → UI (back / forward / reload)
  useEffect(() => {
    const fromParam = searchParams.get("from_date");
    if (fromParam) {
      setActiveMonth(new Date(fromParam));
    }
  }, [searchParams]);

  const range = getMonthRange(activeMonth);

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

  return (
    <div className="flex flex-col gap-1 mt-3 sticky top-6">
      <Label className="text-sm font-semibold">Accounting Month</Label>

      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] justify-between font-normal"
          >
            {format(activeMonth, "MMMM yyyy")}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="range"
            month={activeMonth}
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
