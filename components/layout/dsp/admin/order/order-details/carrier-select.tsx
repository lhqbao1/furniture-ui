"use client";

import * as React from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIPMENT_CARRIERS } from "@/data/data";

interface CarrierSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

const CarrierSelect = ({ value, onChange }: CarrierSelectProps) => {
  const [selectedLabel, setSelectedLabel] = React.useState<string>("");

  React.useEffect(() => {
    if (!value) {
      setSelectedLabel("");
      return;
    }

    if (value === "spedition") {
      const currentIsSpedition = SHIPMENT_CARRIERS.find(
        (c) => c.id === "spedition" && c.label === selectedLabel,
      );
      if (currentIsSpedition) return;

      const defaultSpedition = SHIPMENT_CARRIERS.find(
        (c) => c.id === "spedition",
      );
      setSelectedLabel(defaultSpedition?.label ?? "");
      return;
    }

    const match = SHIPMENT_CARRIERS.find((c) => c.id === value);
    setSelectedLabel(match?.label ?? "");
  }, [value, selectedLabel]);

  const selected = selectedLabel
    ? SHIPMENT_CARRIERS.find((c) => c.label === selectedLabel)
    : value
      ? SHIPMENT_CARRIERS.find((c) => c.id === value)
      : undefined;

  return (
    <Select
      value={selectedLabel}
      onValueChange={(label) => {
        setSelectedLabel(label);
        const carrier = SHIPMENT_CARRIERS.find((c) => c.label === label);
        onChange(carrier?.id ?? label);
      }}
    >
      <SelectTrigger
        className="w-full flex items-center gap-2 border"
        placeholderColor
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <Image
              src={selected.logo}
              alt={selected.label}
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="capitalize">{selected.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Select carrier</span>
        )}
      </SelectTrigger>

      <SelectContent>
        {SHIPMENT_CARRIERS.map((carrier) => (
          <SelectItem key={carrier.label} value={carrier.label}>
            <div className="flex items-center gap-2">
              <Image
                src={carrier.logo}
                alt={carrier.label}
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="capitalize">{carrier.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CarrierSelect;
