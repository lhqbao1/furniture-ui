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
import { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
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
import { useTranslations } from "next-intl";

interface CheckOutShippingAddressProps {
  isAdmin?: boolean;
}

interface ShippingAddressValues {
  address: string;
  additional_address: string;
  recipient_name: string;
  city?: string;
  country: string;
  phone: string;
  postal_code: string;
  email_shipping?: string;
}

export default function ManualCheckOutShippingAddress({
  isAdmin = false,
}: CheckOutShippingAddressProps) {
  const t = useTranslations();
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const [isSameInvoice, setIsSameInvoice] = useState(true);

  const shippingSnapshot = useRef<ShippingAddressValues | null>(null);
  const prevIsSameInvoice = useRef(isSameInvoice);

  const invoiceValues = useWatch({
    control: form.control,
    name: [
      "invoice_address",
      "invoice_postal_code",
      "invoice_city",
      "invoice_additional_address",
      "invoice_country",
      "invoice_recipient_name",
      "invoice_phone",
      "email_invoice",
    ],
  });

  const invoiceSnapshot = JSON.stringify(invoiceValues);

  // // 1) Sync invoice <- shipping KHI VÀ CHỈ KHI isSameInvoice = true
  useEffect(() => {
    if (!isSameInvoice) return;

    const [
      invoice_address,
      invoice_postal_code,
      invoice_city,
      invoice_additional_address,
      invoice_country,
      invoice_recipient_name,
      invoice_phone,
      email_invoice,
    ] = JSON.parse(invoiceSnapshot);

    form.setValue("address", invoice_address || "");
    form.setValue("postal_code", invoice_postal_code || "");
    form.setValue("city", invoice_city || "");
    form.setValue("additional_address", invoice_additional_address || "");
    form.setValue("country", invoice_country || "");
    form.setValue("recipient_name", invoice_recipient_name || "");
    form.setValue("phone", invoice_phone || "");
    form.setValue("email_shipping", email_invoice || "");
  }, [isSameInvoice, invoiceSnapshot]);

  // // 2) Bắt moment toggle để snapshot / restore
  useEffect(() => {
    // từ false -> true
    if (isSameInvoice && !prevIsSameInvoice.current) {
      // snapshot invoice hiện tại
      shippingSnapshot.current = {
        address: form.getValues("address"),
        postal_code: form.getValues("postal_code"),
        city: form.getValues("city"),
        additional_address: form.getValues("additional_address"),
        country: form.getValues("country"),
        recipient_name: form.getValues("recipient_name"),
        phone: form.getValues("phone"),
        email_shipping: form.getValues("email_shipping"),
      };
    }

    // từ true -> false
    if (!isSameInvoice && prevIsSameInvoice.current) {
      if (shippingSnapshot.current) {
        form.setValue("address", shippingSnapshot.current.address);
        form.setValue("postal_code", shippingSnapshot.current.postal_code);
        form.setValue("city", shippingSnapshot.current.city);
        form.setValue("country", shippingSnapshot.current.country);
        form.setValue(
          "additional_address",
          shippingSnapshot.current.additional_address,
        );
        form.setValue(
          "recipient_name",
          shippingSnapshot.current.recipient_name,
        );
        form.setValue("phone", shippingSnapshot.current.phone);
        form.setValue(
          "email_shipping",
          shippingSnapshot.current.email_shipping,
        );
      }
    }

    prevIsSameInvoice.current = isSameInvoice;
  }, [isSameInvoice, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold ">Shipping Address</h2>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Label htmlFor="same-invoice">Same as Invoice</Label>
          <Switch
            id="same-invoice"
            checked={isSameInvoice}
            onCheckedChange={setIsSameInvoice}
            className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
          />
        </div>
      </div>
      {isSameInvoice === true ? (
        ""
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="recipient_name"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-black font-semibold text-sm">
                    Recipient Name
                  </FormLabel>
                  <FormControl>
                    <Input
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
              name="phone"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-black font-semibold text-sm">
                    Recipient Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Address Line */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-black font-semibold text-sm">
                  Street and House number
                </FormLabel>
                <FormControl>
                  <Input
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
            name="additional_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-semibold text-sm">
                  Additional Address Line
                </FormLabel>
                <FormControl>
                  <Input
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
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-semibold text-sm">
                  Postal Code
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-semibold text-sm">
                  City
                </FormLabel>
                <FormControl>
                  <Input
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
            name="country"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-black font-semibold text-sm">
                  Country
                </FormLabel>

                <Popover
                  open={open}
                  onOpenChange={setOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        onClick={() => setOpen(!open)}
                      >
                        {field.value
                          ? COUNTRY_OPTIONS.find((c) => c.value === field.value)
                              ?.label
                          : "Select country"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0 h-[250px] pointer-events-auto">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_OPTIONS.map((c) => (
                            <CommandItem
                              key={c.value}
                              value={c.label}
                              onSelect={() => {
                                field.onChange(c.value);
                                setOpen(false); // 🔥 đóng popover sau khi chọn
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

          <FormField
            control={form.control}
            name="email_shipping"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
