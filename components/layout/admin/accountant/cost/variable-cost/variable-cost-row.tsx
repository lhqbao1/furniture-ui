"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { VariableCostItemUI } from "@/types/variable-fee";

interface VariableFeeRowProps {
  fee: VariableCostItemUI;
  onChange: (value: number | "") => void;
  onRemove: () => void;
}

export function VariableFeeRow({
  fee,
  onChange,
  onRemove,
}: VariableFeeRowProps) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
      <div className="text-sm capitalize">{fee.type}</div>

      <Input
        type="number"
        placeholder="Amount (€)"
        value={fee.amount}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
