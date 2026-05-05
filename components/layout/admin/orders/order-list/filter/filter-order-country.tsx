"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import {
  normalizeOrderCountryCode,
  ORDER_EUROPEAN_COUNTRY_OPTIONS,
} from "./order-country-filter-options";

export default function OrderCountryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const selectedCode = normalizeOrderCountryCode(searchParams.get("country"));
  const selectedCountry = ORDER_EUROPEAN_COUNTRY_OPTIONS.find(
    (country) => country.key === selectedCode,
  );

  const handleSelect = (countryCode: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCode === countryCode) {
      params.delete("country");
    } else {
      params.set("country", countryCode);
    }

    router.push(`?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Country</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between border text-black",
              !selectedCountry && "text-muted-foreground",
            )}
          >
            {selectedCountry ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-base leading-none">
                  {selectedCountry.flag}
                </span>
                <span className="truncate">{selectedCountry.label}</span>
              </span>
            ) : (
              "Choose country"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="z-[80] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
        >
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList className="max-h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {ORDER_EUROPEAN_COUNTRY_OPTIONS.map((country) => (
                  <CommandItem
                    key={country.key}
                    value={`${country.label} ${country.key}`}
                    className="cursor-pointer"
                    onSelect={() => handleSelect(country.key)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCode === country.key
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="mr-2 text-base leading-none">
                      {country.flag}
                    </span>
                    <span className="truncate">{country.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {country.key}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
