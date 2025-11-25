"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface CheckOutShippingAddressProps {
  isAdmin?: boolean;
}

function CheckOutShippingAddress({
  isAdmin = false,
}: CheckOutShippingAddressProps) {
  const form = useFormContext();
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold ">
          {isAdmin ? "Shipping Address" : t("shippingAddress")}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Address Line */}
        <FormField
          control={form.control}
          name="shipping_address_line"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-[#666666] text-sm">
                {isAdmin ? "Address Line" : t("addressLine")}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="address-line1"
                  placeholder=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipping_address_additional"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>
                {isAdmin ? "Additional Address" : t("addressSupplement")}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="address-line2"
                  placeholder=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Postal Code */}
        <FormField
          control={form.control}
          name="shipping_postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#666666] text-sm">
                {isAdmin ? "Postal Code" : t("postalCode")}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          control={form.control}
          name="shipping_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#666666] text-sm">
                {isAdmin ? "City" : t("city")}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="address-level2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
                    control={form.control}
                    name="shipping_city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">{isAdmin ? "City" : t('city')}</FormLabel>
                            <FormControl>
                                <Popover open={open && !isSameInvoice} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            disabled={isSameInvoice}
                                        >
                                            {field.value || (isAdmin ? "Select City" : t('selectCity'))}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    {!isSameInvoice && (
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="" />
                                                <CommandEmpty>{t('noCity')}</CommandEmpty>
                                                <CommandList className="h-[400px]">
                                                    <CommandGroup>
                                                        <CommandGroup>
                                                            {cityOptions.map((c, index) => (
                                                                <CommandItem
                                                                    key={index}
                                                                    value={c.value}
                                                                    onSelect={() => {
                                                                        field.onChange(c.value)
                                                                        setOpen(false) // đóng popover sau khi chọn
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === c.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {c.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    )}
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}
      </div>
    </div>
  );
}

export default React.memo(CheckOutShippingAddress);
