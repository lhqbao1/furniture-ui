"use client";

import { FixedCostRow } from "./fixed-cost-row";
import { FixedCostRowSkeleton } from "./skeleton";
import { FixedCostItemUI } from "./useFixedCostForm";

interface FixedCostListProps {
  items: FixedCostItemUI[];
  isLoading: boolean;
  isReadonly: boolean;
  onUpdate: (
    index: number,
    field: keyof FixedCostItemUI,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export function FixedCostList({
  items,
  isLoading,
  isReadonly,
  onUpdate,
  onRemove,
}: FixedCostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {items.map((_, index) => (
          <FixedCostRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <FixedCostRow
          key={index}
          item={item}
          index={index}
          isReadonly={isReadonly}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
