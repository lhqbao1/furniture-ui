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

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const CarrierSelect = ({ value, onChange }: CarrierSelectProps) => {
  const selected = SHIPMENT_CARRIERS.find((c) => c.id === value);

  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger
        className="w-full flex items-center gap-2 border"
        placeholderColor
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <Image
              src={selected.logo}
              alt={selected.id}
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="capitalize">{selected.id}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Select carrier</span>
        )}
      </SelectTrigger>

      <SelectContent>
        {SHIPMENT_CARRIERS.map((carrier) => (
          <SelectItem
            key={carrier.id}
            value={carrier.id}
          >
            <div className="flex items-center gap-2">
              <Image
                src={carrier.logo}
                alt={carrier.id}
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="capitalize">{carrier.id}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CarrierSelect;
