"use client";

import { useFormContext, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { COUNTRY_OPTIONS } from "@/data/data";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
interface CheckOutShippingAddressProps {
  isAdmin?: boolean;
}
interface ShippingAddressValues {
  shipping_address_line: string;
  shipping_address_additional: string;
  shipping_recipient_name: string;
  shipping_city?: string;
  shipping_country: string;
  shipping_phone_number: string;
  shipping_postal_code: string;
}

function CheckOutShippingAddress({
  isAdmin = false,
}: CheckOutShippingAddressProps) {
  const form = useFormContext();
  const t = useTranslations();
  const [openShippingCountry, setOpenShippingCountry] = useState(false);
  const [isSameInvoice, setIsSameInvoice] = useState(true);

  const shippingSnapshot = useRef<ShippingAddressValues | null>(null);
  const prevIsSameInvoice = useRef(isSameInvoice);

  const invoiceValues = useWatch({
    control: form.control,
    name: [
      "invoice_address_line",
      "invoice_postal_code",
      "invoice_city",
      "invoice_address_additional",
      "invoice_country",
      "first_name",
      "last_name",
      "phone_number",
    ],
  });

  const invoiceSnapshot = JSON.stringify(invoiceValues);

  // // 1) Sync invoice <- shipping KHI VÀ CHỈ KHI isSameInvoice = true
  useEffect(() => {
    if (!isSameInvoice) return;

    const [
      invoice_address_line,
      invoice_postal_code,
      invoice_city,
      invoice_address_additional,
      invoice_country,
      first_name,
      last_name,
      phone_number,
    ] = JSON.parse(invoiceSnapshot);

    const combinedName = `${first_name || ""} ${last_name || ""}`.trim();

    form.setValue("shipping_address_line", invoice_address_line || "");
    form.setValue("shipping_postal_code", invoice_postal_code || "");
    form.setValue("shipping_city", invoice_city || "");
    form.setValue(
      "shipping_address_additional",
      invoice_address_additional || "",
    );
    form.setValue("shipping_country", invoice_country || "");
    form.setValue("shipping_recipient_name", combinedName || "");
    form.setValue("shipping_phone_number", phone_number || "");
  }, [isSameInvoice, invoiceSnapshot]);

  // // 2) Bắt moment toggle để snapshot / restore
  useEffect(() => {
    // từ false -> true
    if (isSameInvoice && !prevIsSameInvoice.current) {
      // snapshot invoice hiện tại
      shippingSnapshot.current = {
        shipping_address_line: form.getValues("shipping_address_line"),
        shipping_postal_code: form.getValues("shipping_postal_code"),
        shipping_city: form.getValues("shipping_city"),
        shipping_address_additional: form.getValues(
          "shipping_address_additional",
        ),
        shipping_country: form.getValues("shipping_country"),
        shipping_recipient_name: form.getValues("shipping_recipient_name"),
        shipping_phone_number: form.getValues("shipping_phone_number"),
      };
    }

    // từ true -> false
    if (!isSameInvoice && prevIsSameInvoice.current) {
      if (shippingSnapshot.current) {
        form.setValue(
          "shipping_address_line",
          shippingSnapshot.current.shipping_address_line,
        );
        form.setValue(
          "shipping_postal_code",
          shippingSnapshot.current.shipping_postal_code,
        );
        form.setValue("shipping_city", shippingSnapshot.current.shipping_city);
        form.setValue(
          "shipping_country",
          shippingSnapshot.current.shipping_country,
        );
        form.setValue(
          "shipping_address_additional",
          shippingSnapshot.current.shipping_address_additional,
        );
        form.setValue(
          "shipping_recipient_name",
          shippingSnapshot.current.shipping_recipient_name,
        );
        form.setValue(
          "shipping_phone_number",
          shippingSnapshot.current.shipping_phone_number,
        );
      }
    }

    prevIsSameInvoice.current = isSameInvoice;
  }, [isSameInvoice, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold mb-0">
          {t("shippingAddress")}
        </h2>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Label htmlFor="same-invoice">{t("sameAsInvoce")}</Label>
          <Switch
            id="same-invoice"
            checked={isSameInvoice}
            onCheckedChange={setIsSameInvoice}
            className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
          />
        </div>
      </div>
      {isSameInvoice ? (
        ""
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shipping_recipient_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-black text-sm">
                  {t("recipientName")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="shipping_recipient_name"
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
            name="shipping_phone_number"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-black text-sm">
                  {t("phone_number")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Address Line */}
          <FormField
            control={form.control}
            name="shipping_address_line"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-black text-sm">
                  {t("streetAndHouse")}
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
                <FormLabel className="text-black text-sm">
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
                <FormLabel className="text-black text-sm">
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
                <FormLabel className="text-black text-sm">
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

          <FormField
            control={form.control}
            name="shipping_country"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-black text-sm">
                  {t("country")}
                </FormLabel>

                <Popover
                  open={openShippingCountry}
                  onOpenChange={setOpenShippingCountry}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        onClick={() =>
                          setOpenShippingCountry(!openShippingCountry)
                        }
                      >
                        {field.value
                          ? COUNTRY_OPTIONS.find((c) => c.value === field.value)
                              ?.label
                          : "Select country"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0 h-[150px]">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>{t("noCountry")}</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_OPTIONS.map((c) => (
                            <CommandItem
                              key={c.value}
                              value={c.label}
                              onSelect={() => {
                                field.onChange(c.value);
                                setOpenShippingCountry(false); // 🔥 đóng popover sau khi chọn
                              }}
                              className="cursor-pointer"
                            >
                              {c.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(CheckOutShippingAddress);
