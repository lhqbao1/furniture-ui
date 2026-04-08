"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetBrands } from "@/features/brand/hook";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

const GpsrInput = () => {
  const form = useFormContext();
  const { data: brands, isLoading: isLoadingBrand } = useGetBrands();
  const [open, setOpen] = useState(false);

  const brandId = form.watch("brand_id") ?? "";
  const isEconelo = form.watch("is_econelo");

  // Lấy brand đang chọn (memo để tránh re-render không cần thiết)
  const selectedBrand = useMemo(() => {
    return brands?.find((b) => b.id === brandId);
  }, [brandId, brands]);

  // ✅ Chỉ setValue khi giá trị thật sự thay đổi
  useEffect(() => {
    if (!selectedBrand) return;

    const isBrandEconelo = selectedBrand.name
      ?.toLowerCase()
      .includes("econelo");

    // chỉ update nếu khác giá trị hiện tại để tránh vòng lặp
    if (isEconelo !== isBrandEconelo) {
      form.setValue("is_econelo", isBrandEconelo);
    }
  }, [selectedBrand, isEconelo, form]);

  return (
    <FormField
      control={form.control}
      name="brand_id"
      render={({ field }) => (
        <FormItem className="grid grid-cols-6 w-full">
          <FormLabel className="text-black font-semibold text-sm col-span-6">
            Brand
          </FormLabel>
          <FormControl className="col-span-6">
            <div>
              {isLoadingBrand ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-light"
                    >
                      {selectedBrand?.name || "Select brand"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[80] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto">
                    <Command>
                      <CommandInput placeholder="Search brand name..." />
                      <CommandEmpty>No brand found.</CommandEmpty>
                      <CommandList className="max-h-[400px]">
                        <CommandGroup>
                          <CommandItem
                            value="No brand"
                            onSelect={() => {
                              field.onChange(null);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !field.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            No brand
                          </CommandItem>
                          {brands?.map((b) => (
                            <CommandItem
                              key={b.id}
                              value={b.name}
                              onSelect={() => {
                                field.onChange(b.id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === b.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {b.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              {/* Hiển thị thông tin brand */}
              {selectedBrand && (
                <ul className="list-disc list-inside mt-2 ml-2 text-sm text-black space-y-1">
                  <li>{selectedBrand.company_email}</li>
                  <li>{selectedBrand.company_address}</li>
                </ul>
              )}
            </div>
          </FormControl>
          <FormMessage className="col-span-6" />
        </FormItem>
      )}
    />
  );
};

export default GpsrInput;
