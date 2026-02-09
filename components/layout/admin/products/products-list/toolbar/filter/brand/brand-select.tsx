"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandResponse } from "@/types/brand";

interface SupplierSelectProps {
  brands: BrandResponse[];
  brand: string;
  setBrand: (brand: string) => void;
}

export default function BrandSelect({
  brands,
  brand,
  setBrand,
}: SupplierSelectProps) {
  const [open, setOpen] = useState(false);

  const extendedBrands: BrandResponse[] = [
    {
      id: "",
      name: "All",
      company_address: "",
      company_city: "",
      company_country: "",
      company_email: "",
      company_name: "",
      company_phone: "",
      company_postal_code: "",
      code: 0,
      created_at: "",
      img_url: "",
      updated_at: "",
    },

    ...brands,
  ];

  const selectedLabel =
    extendedBrands?.find((s) => s.id === brand)?.name || "Select brand";

  return (
    <div className="space-y-2 w-1/2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 pointer-events-auto h-75">
          <Command>
            <CommandInput placeholder="Search brand..." />
            <CommandList>
              <CommandEmpty>No brand found.</CommandEmpty>

              {[
                extendedBrands[0],
                ...extendedBrands
                  .slice(1) // tránh mutate array gốc
                  .sort((a, b) =>
                    a.name.localeCompare(b.name, "de", {
                      sensitivity: "base",
                    }),
                  ),
              ].map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name.toLowerCase()}
                    onSelect={() => {
                      setBrand(item.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    {item.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        item.id === brand ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
