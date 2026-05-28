"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter, useSearchParams } from "next/navigation";

type ShipmentFilterValue = "all" | "with_shipment";

const parseShipmentFilterValue = (
  value: string | null,
): ShipmentFilterValue => {
  if (!value) return "all";
  return value.trim().toLowerCase() === "true" ? "with_shipment" : "all";
};

export default function OrderShipmentFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selected = parseShipmentFilterValue(searchParams.get("filter_by_shipment"));

  const handleChange = (value: ShipmentFilterValue) => {
    const params = new URLSearchParams(searchParams);

    if (value === "with_shipment") {
      params.set("filter_by_shipment", "true");
    } else {
      params.delete("filter_by_shipment");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Shipment</Label>
      <RadioGroup
        value={selected}
        onValueChange={(value) => handleChange(value as ShipmentFilterValue)}
        className="flex flex-wrap items-center gap-4 rounded-lg border border-secondary/15 bg-muted/20 p-3"
      >
        <label
          htmlFor="shipment-all"
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <RadioGroupItem value="all" id="shipment-all" />
          <span>All orders</span>
        </label>

        <label
          htmlFor="shipment-only"
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <RadioGroupItem value="with_shipment" id="shipment-only" />
          <span>Only with shipment</span>
        </label>
      </RadioGroup>
    </div>
  );
}
