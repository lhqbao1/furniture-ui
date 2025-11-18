"use client";
import { Calendar } from "@/components/ui/calendar";
import { Statistic } from "@/types/statistics";
import React from "react";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar1 } from "lucide-react";

interface StatisticsProps {
  statistic?: Statistic[];
  isOrder?: boolean;
  fromDate?: string;
  setFromDate?: React.Dispatch<React.SetStateAction<string | undefined>>;
  endDate?: string;
  setEndDate?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

// Convert Date → YYYY_MM_DD
function formatShort(date?: Date) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function getStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 0);
  return d;
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

const ProductStatistic = ({
  statistic,
  isOrder,
  fromDate,
  setFromDate,
  endDate,
  setEndDate,
}: StatisticsProps) => {
  const selectedRange: DateRange | undefined =
    fromDate && endDate
      ? {
          from: parseDate(fromDate),
          to: parseDate(endDate),
        }
      : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return;

    if (range.from && setFromDate) {
      setFromDate(formatDate(getStartOfDay(range.from)));
    }

    if (range.to && setEndDate) {
      setEndDate(formatDate(getEndOfDay(range.to)));
    }
  };

  // 🟦 Hiển thị text cho nút trigger
  const triggerLabel = (() => {
    const from = parseDate(fromDate);
    const to = parseDate(endDate);

    if (from && to)
      return (
        <div>
          Date: {formatShort(from)} - {formatShort(to)}
        </div>
      );
    if (from) return <div>Date: {formatShort(from)} - ...</div>;

    return (
      <div className="flex gap-2 items-center">
        <Calendar1 />
        <div className="pt-0.5">Select Date</div>
      </div>
    );
  })();

  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
      {(statistic ?? []).map((item, index) => (
        <div
          key={index}
          className="rounded-sm py-4 flex flex-col justify-center items-center gap-2 border"
          style={{
            backgroundColor: item.color ?? "white",
            opacity: 30,
          }}
        >
          <div
            className="uppercase font-semibold text-center text-2xl"
            style={{ color: item.textColor }}
          >
            {item.label}
          </div>

          {isOrder && <div className="text-xl">{item.count}</div>}

          <div className="text-3xl font-light text-[#4D4D4D]">
            €{item.total.toLocaleString()}
          </div>
        </div>
      ))}

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-start w-full"
          >
            {triggerLabel}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-2">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProductStatistic;
