"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

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

export default function MonthRangeCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeMonth, setActiveMonth] = useState<Date>(() => {
    const fromParam = searchParams.get("from_date");
    return fromParam ? new Date(fromParam) : new Date();
  });

  // 🔄 Sync URL → UI (back/forward, reload)
  useEffect(() => {
    const fromParam = searchParams.get("from_date");
    if (fromParam) {
      setActiveMonth(new Date(fromParam));
    }
  }, [searchParams]);

  const range = getMonthRange(activeMonth);

  const handleMonthChange = (month: Date) => {
    setActiveMonth(month); // ✅ highlight update ngay

    const { from, to } = getMonthRange(month);
    const params = new URLSearchParams(searchParams);

    params.set("from_date", formatDate(from));
    params.set("to_date", formatDate(to));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-0 z-30 bg-background border-b p-4">
      <Label className="font-semibold mb-2 block">Accounting Month</Label>

      <Calendar
        mode="range"
        month={activeMonth}
        selected={range}
        onMonthChange={handleMonthChange}
        showOutsideDays={false}
        captionLayout="dropdown"
        disabled={() => true}
      />
    </div>
  );
}
