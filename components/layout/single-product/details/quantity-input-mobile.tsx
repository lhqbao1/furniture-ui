"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NO_FOCUS } from "@/lib/constant";

interface FormQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function FormQuantityInputMobile({
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
    <div className={cn("relative w-full", className)}>
      {/* ➖ Minus */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 h-full w-8 rounded-tr-none rounded-br-none rounded-tl-full rounded-bl-full border-r",
          NO_FOCUS,
        )}
      >
        <Minus size={14} />
      </Button>

      {/* INPUT */}
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        readOnly
        inputMode="numeric"
        onChange={(e) => {
          const v = Math.max(
            min,
            Math.min(Number(e.target.value), max ?? Infinity),
          );

          if (!Number.isNaN(v)) {
            onChange(v);
          }
        }}
        className="
          h-full
          text-center 
          px-10
          appearance-none 
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      {/* ➕ Plus */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 h-full w-8 rounded-tr-full rounded-br-full rounded-tl-none rounded-bl-none border-l",
          NO_FOCUS,
        )}
      >
        <Plus size={14} />
      </Button>
    </div>
  );
}
