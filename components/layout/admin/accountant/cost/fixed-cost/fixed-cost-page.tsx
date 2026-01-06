"use client";

import { Button } from "@/components/ui/button";
import { useFixedCostForm } from "./useFixedCostForm";
import { FixedCostHeader } from "./fixed-cost-header";
import { FixedCostList } from "./fixed-cost-list";

export default function FixedCostPage() {
  const {
    month,
    year,
    setMonth,
    setYear,
    items,
    isLoading,
    isReadonly,
    updateItem,
    removeRow,
    addRow,
    submit,
    isSubmitting,
    hasChanges,
  } = useFixedCostForm();

  return (
    <div className="space-y-4 lg:w-1/3 w-full">
      <FixedCostHeader
        month={month}
        year={year}
        setMonth={setMonth}
        setYear={setYear}
        isReadonly={isReadonly}
      />

      <FixedCostList
        items={items}
        isLoading={isLoading}
        isReadonly={isReadonly}
        onUpdate={updateItem}
        onRemove={removeRow}
      />

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={addRow}
          disabled={isReadonly}
        >
          + Add new cost
        </Button>

        <Button
          onClick={submit}
          disabled={isReadonly || isSubmitting || !hasChanges}
        >
          {isReadonly
            ? "Past month locked"
            : isSubmitting
            ? "Submitting..."
            : "Submit fixed costs"}
        </Button>
      </div>
    </div>
  );
}
