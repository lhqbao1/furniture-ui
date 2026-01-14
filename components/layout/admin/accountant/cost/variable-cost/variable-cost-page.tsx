"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VariableMarketplaceCard } from "./variable-cost-card";
import { useVariableCost } from "./useVariableCost";
import VariableCostTable from "./variable-cost-table";
import { VariableCostHeader } from "./variable-cost-header";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export default function VariableCostPage() {
  const now = new Date();

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [newMarketplace, setNewMarketplace] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const {
    marketplaces,
    addMarketplace,
    addFee,
    updateAmount,
    removeFee,
    submit,
    isSubmitting,
  } = useVariableCost({
    month,
    year,
    setMonth,
    setYear,
  });

  return (
    <div className="space-y-6">
      <VariableCostHeader
        month={month}
        year={year}
        setMonth={setMonth}
        setYear={setYear}
      />
      <div className="border-b">
        <VariableCostTable
          month={month}
          year={year}
          setMonth={setMonth}
          setYear={setYear}
        />
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="font-medium">
          Add variable cost for{" "}
          {new Date(0, month - 1).toLocaleString("en-US", {
            month: "long",
          })}{" "}
          {year}
        </div>
        <Button
          variant="outline"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add marketplace
        </Button>
      </div>

      {adding && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Input
            placeholder="Marketplace name"
            value={newMarketplace}
            onChange={(e) => setNewMarketplace(e.target.value)}
            className="w-64"
          />

          <Button
            onClick={() => {
              if (!newMarketplace.trim()) return;
              addMarketplace(newMarketplace.trim().toLowerCase());
              setNewMarketplace("");
              setAdding(false);
            }}
          >
            Submit
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setAdding(false);
              setNewMarketplace("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {marketplaces.map((m) => (
          <VariableMarketplaceCard
            key={m.marketplace}
            data={m}
            onAddFee={(type) => addFee(m.marketplace, type)}
            onUpdateFee={(type, value) =>
              updateAmount(m.marketplace, type, value)
            }
            onRemoveFee={(type) => removeFee(m.marketplace, type)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Submit variable costs"}
        </Button>
      </div>
    </div>
  );
}
