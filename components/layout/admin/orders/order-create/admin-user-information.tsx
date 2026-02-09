"use client";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { COUNTRY_OPTIONS } from "@/data/data";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";

interface AdminCheckOutUserInformationProps {
  userId?: string;
  setUserId?: (id: string) => void;
  isAdmin?: boolean;
  disabledFields: string[];
}

export function AdminCheckOutUserInformation({
  userId,
  setUserId,
  isAdmin = false,
  disabledFields,
}: AdminCheckOutUserInformationProps) {
  const form = useFormContext();
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const phoneNumber = useWatch({
    control: form.control,
    name: "phone_number",
  });

  const firstName = useWatch({
    control: form.control,
    name: "first_name",
  });

  const lastName = useWatch({
    control: form.control,
    name: "last_name",
  });

  const email = useWatch({
    control: form.control,
    name: "email",
  });

  // Sync invoice_phone = phone_number
  useEffect(() => {
    form.setValue("email_invoice", email ?? "");
    form.setValue("invoice_phone", phoneNumber ?? "");
    form.setValue(
      "invoice_recipient_name",
      [firstName, lastName].filter(Boolean).join(" "),
    );
  }, [phoneNumber, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold ">User Information</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>{t("gender")}</FormLabel> */}
                <FormControl>
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value ?? ""}
                    className="flex gap-4"
                  >
                    <FormItem className="flex gap-1 items-center">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="ml-2">{t("male")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-1 items-center">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="ml-2">{t("female")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-1 items-center">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="ml-2">{t("otherGender")}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Company name (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""} // 👈 đảm bảo controlled
                  disabled={disabledFields.includes("company_name")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabledFields.includes("tax_id")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder=""
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Nếu input trống => set null
                    field.onChange(value === "" ? null : value);
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_address"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Street and House number</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={disabledFields.includes("invoice_address")}
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
                  {...field}
                  value={field.value ?? ""} // 👈 đảm bảo controlled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={disabledFields.includes("invoice_postal_code")}
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
                  disabled={disabledFields.includes("invoice_city")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_country"
          render={({ field }) => {
            const isDisabled = disabledFields.includes("invoice_country"); // hoặc logic của bạn

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-black font-semibold text-sm">
                  Country
                </FormLabel>

                <Popover
                  open={isDisabled ? false : open} // ❌ Không cho mở nếu disabled
                  onOpenChange={(val) => !isDisabled && setOpen(val)}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={isDisabled} // 🔥 Disable UI
                      >
                        {field.value
                          ? COUNTRY_OPTIONS.find((c) => c.value === field.value)
                              ?.label
                          : "Select country"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  {!isDisabled /* ❗ Không render popover khi disabled */ && (
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
                                  setOpen(false);
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
                  )}
                </Popover>

                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}
