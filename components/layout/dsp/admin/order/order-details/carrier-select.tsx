"use client";

import * as React from "react";
import Image from "next/image";
import { Package, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SHIPMENT_CARRIERS } from "@/data/data";

const OTHER_ID = "other";

interface CarrierSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

const CarrierSelect = ({ value, onChange }: CarrierSelectProps) => {
  const isKnownCarrier = SHIPMENT_CARRIERS.some((c) => c.id === value);

  // Custom (free text) mode is active once the user picks "Other", or when
  // the current value doesn't match any predefined carrier id (e.g. loaded
  // from a saved order that already has a custom carrier name).
  const [isCustom, setIsCustom] = React.useState(() => !!value && !isKnownCarrier);

  React.useEffect(() => {
    if (value && !isKnownCarrier) {
      setIsCustom(true);
    }
  }, [value, isKnownCarrier]);

  const selected = SHIPMENT_CARRIERS.find((c) => c.id === value);

  if (isCustom) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Enter shipping carrier"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Choose from list"
          onClick={() => {
            setIsCustom(false);
            onChange("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(id) => {
        if (id === OTHER_ID) {
          setIsCustom(true);
          onChange("");
          return;
        }
        onChange(id);
      }}
    >
      <SelectTrigger
        className="w-full flex items-center gap-2 border"
        placeholderColor
      >
        {selected ? (
          <div className="flex items-center gap-2">
            {selected.logo ? (
              <Image
                src={selected.logo}
                alt={selected.label}
                width={20}
                height={20}
                className="object-contain"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="capitalize">{selected.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Select carrier</span>
        )}
      </SelectTrigger>

      <SelectContent>
        {SHIPMENT_CARRIERS.map((carrier) => (
          <SelectItem key={carrier.id} value={carrier.id}>
            <div className="flex items-center gap-2">
              {carrier.logo ? (
                <Image
                  src={carrier.logo}
                  alt={carrier.label}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="capitalize">{carrier.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CarrierSelect;
