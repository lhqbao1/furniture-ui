"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VariableMarketplaceUI } from "@/types/variable-fee";
import { VariableFeeRow } from "./variable-cost-row";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface VariableMarketplaceCardProps {
  data: VariableMarketplaceUI;
  onAddFee: (type: string) => void;
  onUpdateFee: (type: string, value: number | "") => void;
  onRemoveFee: (type: string) => void;
}

export function VariableMarketplaceCard({
  data,
  onAddFee,
  onUpdateFee,
  onRemoveFee,
}: VariableMarketplaceCardProps) {
  const [newFeeType, setNewFeeType] = useState("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="font-medium capitalize">
          {typeof data?.marketplace === "string"
            ? data.marketplace.replace(/_/g, " ")
            : ""}
        </div>

        {/* <div className="flex gap-2">
          <Input
            placeholder="Fee label (e.g. shipping_fedex)"
            value={newFeeType}
            onChange={(e) => setNewFeeType(e.target.value)}
          />

          <Button
            variant="outline"
            size="sm"
            disabled={!newFeeType.trim()}
            onClick={() => {
              onAddFee(newFeeType.trim());
              setNewFeeType("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div> */}
      </CardHeader>

      <CardContent className="space-y-3">
        {data.fees.map((fee) => (
          <VariableFeeRow
            key={fee.type}
            fee={fee}
            onChange={(value) => onUpdateFee(fee.type, value)}
            onRemove={() => onRemoveFee(fee.type)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
