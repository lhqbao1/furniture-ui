"use client";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useRef, useState } from "react";
import "react-phone-input-2/lib/style.css";
import { useTranslations } from "next-intl";
import { City, State } from "country-state-city";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { COUNTRY_OPTIONS } from "@/data/data";

interface InvoiceAddressValues {
  invoice_address: string;
  invoice_postal_code: string;
  invoice_city: string;
  invoice_additional_address?: string;
  invoice_country: string;
  invoice_recipient_name: string;
  invoice_phone: string;
}

interface CheckOutInvoiceAddressProps {
  isAdmin?: boolean;
}

const ManualCheckOutInvoiceAddress = ({
  isAdmin = false,
}: CheckOutInvoiceAddressProps) => {
  const form = useFormContext();
  const t = useTranslations();
  const [isSameShipping, setIsSameShipping] = useState(true);
  const [open, setOpen] = useState(false);

  // Watch shipping fields
  const shippingAddressLine = useWatch({
    name: "address",
    control: form.control,
  });
  const shippingPostalCode = useWatch({
    name: "postal_code",
    control: form.control,
  });
  const shippingCity = useWatch({ name: "city", control: form.control });
  const shippingAdditionalAddress = useWatch({
    name: "additional_address",
    control: form.control,
  });

  const shippingCountry = useWatch({
    name: "country",
    control: form.control,
  });

  const shippingRecipient = useWatch({
    name: "recipient_name",
    control: form.control,
  });

  const shippingPhone = useWatch({
    name: "phone",
    control: form.control,
  });

  // Dùng ref lưu snapshot invoice gốc
  const invoiceSnapshot = useRef<InvoiceAddressValues | null>(null);

  useEffect(() => {
    if (isSameShipping) {
      // Lưu lại dữ liệu invoice hiện tại
      invoiceSnapshot.current = {
        invoice_address: form.getValues("invoice_address"),
        invoice_postal_code: form.getValues("invoice_postal_code"),
        invoice_city: form.getValues("invoice_city"),
        invoice_additional_address: form.getValues(
          "invoice_additional_address",
        ),
        invoice_country: form.getValues("invoice_country"),
        invoice_recipient_name: form.getValues("invoice_recipient_name"),
        invoice_phone: form.getValues("invoice_phone"),
      };

      // Copy shipping → invoice
      form.setValue("invoice_address", shippingAddressLine);
      form.setValue("invoice_postal_code", shippingPostalCode);
      form.setValue("invoice_city", shippingCity);
      form.setValue("invoice_country", shippingCountry);
      form.setValue("invoice_additional_address", shippingAdditionalAddress);
      form.setValue("invoice_recipient_name", shippingRecipient);
      form.setValue("invoice_phone", shippingPhone);
    } else {
      // Restore lại snapshot nếu có
      if (invoiceSnapshot.current) {
        form.setValue(
          "invoice_address",
          invoiceSnapshot.current.invoice_address,
        );
        form.setValue(
          "invoice_postal_code",
          invoiceSnapshot.current.invoice_postal_code,
        );
        form.setValue("invoice_city", invoiceSnapshot.current.invoice_city);
        form.setValue(
          "invoice_country",
          invoiceSnapshot.current.invoice_country,
        );

        form.setValue(
          "invoice_additional_address",
          invoiceSnapshot.current.invoice_additional_address,
        );
        form.setValue(
          "invoice_recipient_name",
          invoiceSnapshot.current.invoice_recipient_name,
        );
        form.setValue("invoice_phone", invoiceSnapshot.current.invoice_phone);
      }
    }
  }, [
    isSameShipping,
    shippingAddressLine,
    shippingPostalCode,
    shippingCity,
    shippingAdditionalAddress,
    shippingCountry,
    shippingRecipient,
    shippingPhone,
    form,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between lg:flex-row flex-col bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold">
          {isAdmin ? "Invoice Address" : t("invoiceAddress")}
        </h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="same-invoice">
            {isAdmin ? "Same as Shipping" : t("sameAsShipping")}
          </Label>
          <Switch
            id="same-invoice"
            checked={isSameShipping}
            onCheckedChange={setIsSameShipping}
            className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
          />
        </div>
      </div>
      {isSameShipping === true ? (
        ""
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice_address"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>
                  {isAdmin ? "Address line" : t("streetAndHouse")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_additional_address"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>
                  {isAdmin
                    ? "Additional Address line"
                    : t("additionalAddressLine")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_country"
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

                  <PopoverContent className="w-full p-0 h-[150px]">
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
            name="invoice_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isAdmin ? "Postal Code" : t("postalCode")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_city"
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

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="invoice_recipient_name"
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
            />{" "}
            <FormField
              control={form.control}
              name="invoice_phone"
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
        </div>
      )}
    </div>
  );
};

export default ManualCheckOutInvoiceAddress;
