"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FixedCostHeaderProps {
  month: number;
  year: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  isReadonly: boolean;
}

export function FixedCostHeader({
  month,
  year,
  setMonth,
  setYear,
  isReadonly,
}: FixedCostHeaderProps) {
  const currentYear = new Date().getFullYear();
  const YEARS = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <>
      {isReadonly && (
        <div className="text-sm text-destructive">
          This month is locked and cannot be edited.
        </div>
      )}

      <div className="flex gap-4">
        <Select
          value={month.toString()}
          onValueChange={(v) => setMonth(Number(v))}
        >
          <SelectTrigger className="w-[160px] border flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }).map((_, i) => (
              <SelectItem
                key={i + 1}
                value={(i + 1).toString()}
              >
                {new Date(0, i).toLocaleString("en-US", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(v) => setYear(Number(v))}
        >
          <SelectTrigger className="w-[120px] border flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem
                key={y}
                value={y.toString()}
              >
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="font-medium">
        Add fixed cost for{" "}
        {new Date(0, month - 1).toLocaleString("en-US", {
          month: "long",
        })}{" "}
        {year}
      </div>
    </>
  );
}
