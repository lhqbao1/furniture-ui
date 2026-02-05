"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EN_COUNTRY_OPTIONS } from "@/data/data";
import { cn } from "@/lib/utils";

type CountryFieldProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export const CountryField = ({
  value,
  onChange,
  required,
}: CountryFieldProps) => {
  const selected = EN_COUNTRY_OPTIONS.find((c) => c.value === value);

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-1">
        Country
        {required && <span className="text-destructive">*</span>}
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
            )}
          >
            {selected ? selected.label : "Select country"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>

            <CommandGroup className="max-h-72 overflow-auto">
              {EN_COUNTRY_OPTIONS.map((c) => (
                <CommandItem
                  key={c.value}
                  value={c.label} // 🔥 SEARCH THEO LABEL
                  onSelect={() => onChange(c.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === c.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
