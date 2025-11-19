"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1 } from "lucide-react";

interface SingleDatePickerProps {
  label: string;
  value?: string;
  onChange: (val: string | undefined) => void;
}

function formatDate(d?: Date) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatFull(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parseDate(str?: string) {
  if (!str) return undefined;
  const t = new Date(str);
  return isNaN(t.getTime()) ? undefined : t;
}

export const SingleDatePicker = ({
  label,
  value,
  onChange,
}: SingleDatePickerProps) => {
  const selected = parseDate(value);
  const today = new Date();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start flex-1"
          type="button"
        >
          <Calendar1 className="mr-2 h-4 w-4" />
          {selected ? formatDate(selected) : label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => onChange(d ? formatFull(d) : undefined)}
          initialFocus
          disabled={(date) => date > today} // 🚫 Block ngày tương lai
        />
      </PopoverContent>
    </Popover>
  );
};
