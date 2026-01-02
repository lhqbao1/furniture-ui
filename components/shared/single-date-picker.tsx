"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SingleDatePickerProps {
  label: string;
  value?: string;
  onChange: (val: string | undefined) => void;
  className?: string;
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
  className,
}: SingleDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const today = new Date();

  const handleSelect = (d?: Date) => {
    if (!d) return;
    onChange(formatFull(d)); // update state
    setOpen(false); // 🔥 đóng popover khi chọn ngày
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      modal={false}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start", className)}
          type="button"
        >
          <Calendar1 className="mr-2 h-4 w-4" />
          {selected ? formatDate(selected) : label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 z-[10000] pointer-events-auto">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) => date > today}
        />
      </PopoverContent>
    </Popover>
  );
};
