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
import { SupplierResponse } from "@/types/supplier";

interface SupplierSelectProps {
  suppliers: SupplierResponse[];
  supplier: string;
  setSupplier: (supplier: string) => void;
}

export default function SupplierSelect({
  suppliers,
  supplier,
  setSupplier,
}: SupplierSelectProps) {
  const [open, setOpen] = useState(false);

  const filteredSuppliers = suppliers?.filter(
    (s) => !s.business_name.includes("tes"),
  );

  const selectedLabel =
    filteredSuppliers?.find((s) => s.id === supplier)?.business_name ||
    "Select supplier";

  return (
    <div className="space-y-2 w-1/2">
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            {selectedLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 pointer-events-auto">
          <Command>
            <CommandInput placeholder="Search supplier..." />
            <CommandList>
              <CommandEmpty>No supplier found.</CommandEmpty>

              {filteredSuppliers
                ?.slice() // tránh mutate array gốc
                .sort((a, b) =>
                  a.business_name.localeCompare(b.business_name, "de", {
                    sensitivity: "base",
                  }),
                )
                .map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.business_name.toLowerCase()}
                    onSelect={() => {
                      setSupplier(item.id);
                      setOpen(false);
                    }}
                  >
                    {item.business_name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        item.id === supplier ? "opacity-100" : "opacity-0",
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
