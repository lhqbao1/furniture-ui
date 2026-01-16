"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const SelectRelatedProducts = () => {
  const [open, setOpen] = React.useState(false);
  const form = useFormContext();

  const { data: listProducts, isLoading } = useGetProductsSelect({
    is_econelo: false,
    all_products: true,
  });

  return (
    <Controller
      name="related_product_id"
      control={form.control}
      render={({ field }) => {
        // đảm bảo luôn là array
        const selected = field.value || [];

        // sort selected lên đầu
        let sortedProducts = listProducts || [];

        if (!isLoading && listProducts && selected.length > 0) {
          sortedProducts = [...listProducts].sort((a, b) => {
            const aSel = selected.includes(a.id);
            const bSel = selected.includes(b.id);
            if (aSel && !bSel) return -1;
            if (bSel && !aSel) return 1;
            return 0;
          });
        }

        const toggle = (id: string) => {
          if (selected.includes(id)) {
            field.onChange(selected.filter((x: string) => x !== id));
          } else {
            field.onChange([...selected, id]);
          }
        };

        return (
          <FormItem className="space-y-2">
            <FormLabel>Related Products</FormLabel>
            <FormControl>
              <Popover open={true}>
                <PopoverTrigger asChild>
                  <span />
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0 max-h-96 overflow-y-auto"
                >
                  <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandGroup className="mt-6">
                      {isLoading &&
                        Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={`skeleton-${i}`}
                            className="flex items-center gap-2 py-2 px-3"
                          >
                            <Skeleton className="h-4 w-4 rounded-sm" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ))}

                      {!isLoading &&
                        sortedProducts.map((g) => (
                          <CommandItem
                            key={g.id}
                            onSelect={() => toggle(g.id)}
                            className="group cursor-pointer"
                          >
                            <div className="flex justify-between w-full">
                              <div className="flex gap-2 items-center text-base">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selected.includes(g.id)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />

                                <Image
                                  src={
                                    g.static_files && g.static_files.length > 0
                                      ? g.static_files[0].url
                                      : "/1.png"
                                  }
                                  width={30}
                                  height={30}
                                  alt=""
                                />

                                <div>
                                  <span
                                    className={cn(
                                      "text-sm",
                                      selected.includes(g.id) &&
                                        "text-secondary font-medium",
                                    )}
                                  >
                                    {g.name}
                                  </span>
                                  <div className="text-sm text-muted-foreground">
                                    {g.id_provider}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default SelectRelatedProducts;
