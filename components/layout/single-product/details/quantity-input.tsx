"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function FormQuantityInput({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  className,
}: FormQuantityInputProps) {
  const handleIncrement = () => {
    const next = max !== undefined ? Math.min(value + step, max) : value + step;
    onChange(next);
  };

  const handleDecrement = () => {
    const next = Math.max(value - step, min);
    onChange(next);
  };

  return (
    <div className={cn("relative flex w-full", className)}>
      {/* INPUT */}
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        inputMode="numeric"
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) {
            onChange(v);
          }
        }}
        className="pr-8 h-10"
      />

      {/* SPINNER */}
      <div className="absolute right-0 top-0 h-full flex flex-col border-l">
        <Button
          type="button"
          aria-label="Increase quantity"
          variant="outline"
          className="px-2 h-1/2 rounded-l-none rounded-br-none border-l-0 border-b"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
        >
          <ChevronUp size={14} />
        </Button>

        <Button
          type="button"
          aria-label="Decrease quantity"
          variant="outline"
          className="px-2 h-1/2 rounded-l-none rounded-tr-none border-l-0 border-t"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <ChevronDown size={14} />
        </Button>
      </div>
    </div>
  );
}
