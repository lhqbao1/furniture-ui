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
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  useGetProductGroup,
  useGetProductsSelect,
} from "@/features/product-group/hook";
import { atom, useAtom } from "jotai";
import { currentProductGroup } from "@/store/product-group";
// import DeleteGroupDialog from "./delete-group-dialog";
// import AddOrEditParentDialog from "./add-or-edit-parent-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const SelectMainProduct = () => {
  const [open, setOpen] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogAddOpen, setDialogAddOpen] = React.useState(false);
  const [currentGroup, setCurrentGroup] = useAtom(currentProductGroup);

  const {
    data: listProducts,
    isLoading,
    isError,
  } = useGetProductsSelect({
    is_econelo: false,
    all_products: true,
  });

  const form = useFormContext();

  return (
    <Controller
      control={form.control}
      name="product_id"
      render={({ field }) => {
        // 👉 đặt sorting logic ở đây

        let sortedProducts = listProducts || [];

        if (!isLoading && listProducts && field.value) {
          sortedProducts = [...listProducts].sort((a, b) => {
            if (a.id === field.value) return -1;
            if (b.id === field.value) return 1;
            return 0;
          });
        }

        return (
          <FormItem className="space-y-2">
            <FormLabel>Main Product</FormLabel>
            <FormControl>
              <Popover open={true}>
                <PopoverTrigger asChild>
                  <span />
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0 max-h-96 overflow-y-auto"
                >
                  <Command className="border-none">
                    <CommandInput placeholder="Search product..." />
                    {/* <CommandEmpty>No group found.</CommandEmpty> */}
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
                            onSelect={() => {
                              setCurrentGroup(g.name);
                              field.onChange(g.id);
                              setOpen(false);
                            }}
                            className="group cursor-pointer"
                          >
                            <div className="flex justify-between w-full">
                              <div className="flex gap-1 items-center text-base">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === g.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />

                                <div className="flex gap-2 items-center">
                                  <Image
                                    src={
                                      g.static_files &&
                                      g.static_files.length > 0
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
                                        field.value === g.id &&
                                          "text-secondary font-medium ",
                                      )}
                                    >
                                      {g.name}
                                    </span>
                                    <div className="text-sm">
                                      {g.id_provider}
                                    </div>
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

export default SelectMainProduct;
