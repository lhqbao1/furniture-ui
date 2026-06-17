"use client";

import { useMemo, useState } from "react";
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
import type { CategoryOption } from "./category-options";

interface CategorySelectProps {
  categories: CategoryOption[];
  categoryId: string;
  setCategoryId: (categoryId: string) => void;
}

export default function CategorySelect({
  categories,
  categoryId,
  setCategoryId,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () => [
      { id: "", name: "All" },
      ...categories.slice().sort((a, b) =>
        a.name.localeCompare(b.name, "de", {
          sensitivity: "base",
        }),
      ),
    ],
    [categories],
  );

  const selectedLabel =
    options.find((category) => category.id === categoryId)?.name ||
    "Select category";

  return (
    <div className="w-1/2 space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">{selectedLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-75 w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto">
          <Command>
            <CommandInput placeholder="Search category..." />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>

              {options.map((item) => (
                <CommandItem
                  key={item.id || "all"}
                  value={`${item.name} ${item.id}`.toLowerCase()}
                  onSelect={() => {
                    setCategoryId(item.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <span className="truncate">{item.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      item.id === categoryId ? "opacity-100" : "opacity-0",
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
