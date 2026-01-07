"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { FixedCostItemUI } from "./useFixedCostForm";

interface FixedCostRowProps {
  item: FixedCostItemUI;
  index: number;
  isReadonly: boolean;
  onUpdate: (
    index: number,
    field: keyof FixedCostItemUI,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export function FixedCostRow({
  item,
  index,
  isReadonly,
  onUpdate,
  onRemove,
}: FixedCostRowProps) {
  return (
    <div
      className={`grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center ${
        item.isCloned ? "text-destructive" : ""
      }`}
    >
      <Input
        // disabled={isReadonly}
        className={item.isCloned ? "border-destructive" : ""}
        placeholder="Cost type"
        value={item.type}
        onChange={(e) => onUpdate(index, "type", e.target.value)}
      />

      <Input
        // disabled={isReadonly}
        className={item.isCloned ? "border-destructive" : ""}
        type="number"
        placeholder="Amount (€)"
        value={item.amount}
        onChange={(e) => onUpdate(index, "amount", e.target.value)}
      />

      <span className="text-muted-foreground text-sm">€</span>

      <Button
        variant="ghost"
        size="icon"
        // disabled={isReadonly}
        onClick={() => onRemove(index)}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
